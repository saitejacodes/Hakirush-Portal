import bcrypt from "bcrypt";
import Client from "../models/Client.js";
import User from "../models/User.js";
import ClientRosterEntry, { JERSEY_SIZES, ROSTER_NAME_MAX, ROSTER_MAX_ENTRIES } from "../models/ClientRosterEntry.js";
import ClientGalleryImage, { GALLERY_CAPTION_MAX } from "../models/ClientGalleryImage.js";
import ClientStanding, { STANDINGS_MAX_ROWS, TEAM_NAME_MAX } from "../models/ClientStanding.js";
import uploadToImageKit, { deleteFromImageKit } from "../utils/uploadToImageKit.js";
import { asyncHandler, badRequest, conflict, forbidden, notFound } from "../middleware/errorHandler.js";
import { requireObjectId, requireEnum, trimmedString, toFiniteNumber, requireYmd } from "../utils/validate.js";

const PLAN_TYPES = ["Annual", "Quarterly"];
const USER_FIELDS = "name email profileImage";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GALLERY_MAX_IMAGES = 200;
const MAX_STAT = 100000;

/* ================= HELPERS ================= */
const clientDto = (client) => {
  const c = typeof client.toObject === "function" ? client.toObject() : client;
  return {
    _id: c._id,
    userId: c.userId && typeof c.userId === "object"
      ? { _id: c.userId._id, name: c.userId.name, email: c.userId.email, profileImage: c.userId.profileImage }
      : c.userId,
    dateOfJoining: c.dateOfJoining,
    companyLogo: c.companyLogo,
    budget: c.budget,
    planType: c.planType,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};

const getOwnClient = async (req) => {
  const client = await Client.findOne({ userId: req.user._id });
  if (!client) throw notFound("Client profile not found");
  return client;
};

const getClientById = async (rawId) => {
  const id = requireObjectId(rawId, "id");
  const client = await Client.findById(id);
  if (!client) throw notFound("Client not found");
  return client;
};

// Legacy ?userId= lookups: client -> always own record; admin -> the given user's client.
const resolveLegacyClient = async (req) => {
  if (req.user.role === "client") return getOwnClient(req);
  if (req.user.role !== "admin") throw forbidden();
  const userId = requireObjectId(req.query.userId, "userId");
  const client = await Client.findOne({ userId });
  if (!client) throw notFound("Client not found");
  return client;
};

const galleryDto = (img) => ({ _id: img._id, url: img.url, caption: img.caption || "", createdAt: img.createdAt });
const rosterDto = (e) => ({ _id: e._id, name: e.name, jerseySize: e.jerseySize, createdAt: e.createdAt, updatedAt: e.updatedAt });

const loadGallery = (clientId) => ClientGalleryImage.find({ clientId }).sort({ createdAt: -1 }).limit(GALLERY_MAX_IMAGES).lean();

const loadStandings = async (clientId) => {
  const doc = await ClientStanding.findOne({ clientId }).lean();
  return {
    standings: (doc?.standings || []).map((r) => ({
      _id: r._id, teamName: r.teamName, played: r.played, won: r.won, lost: r.lost, points: r.points,
    })),
    updatedAt: doc?.updatedAt || null,
  };
};

const parseDateInput = (v, field) => {
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${requireYmd(v, field)}T00:00:00.000Z`);
  const d = new Date(v);
  if (v === undefined || v === null || v === "" || Number.isNaN(d.getTime())) throw badRequest(`${field} must be a valid date`);
  return d;
};

/* ================= ADD CLIENT (ADMIN) ================= */
const addClient = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = trimmedString(body.name, "name", { max: 100 });
  const email = trimmedString(body.email, "email", { max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(email)) throw badRequest("email is invalid");
  if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) {
    throw badRequest("password must be 8-128 characters");
  }
  const planType = requireEnum(body.planType, PLAN_TYPES, "planType");
  const budget = toFiniteNumber(body.budget, "budget", { min: 0, max: 1e12 });
  const dateOfJoining = parseDateInput(body.dateOfJoining, "dateOfJoining");
  if (!req.file?.buffer) throw badRequest("Company logo required");

  if (await User.exists({ email })) throw conflict("Email already exists", "CONFLICT");

  const logoUrl = await uploadToImageKit(req.file, "clients");
  const hashedPassword = await bcrypt.hash(body.password, 10);

  let user;
  try {
    user = await User.create({ name, email, password: hashedPassword, role: "client" });
  } catch (err) {
    if (err?.code === 11000) throw conflict("Email already exists", "CONFLICT");
    throw err;
  }

  let client;
  try {
    client = await Client.create({ userId: user._id, dateOfJoining, planType, budget, companyLogo: logoUrl });
  } catch (err) {
    await User.deleteOne({ _id: user._id }).catch(() => {});
    throw err;
  }

  await client.populate("userId", USER_FIELDS);
  return res.status(201).json({ success: true, client: clientDto(client) });
});

/* ================= GET ALL CLIENTS (ADMIN) ================= */
const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().populate("userId", USER_FIELDS).sort({ createdAt: -1 });
  return res.json({ success: true, clients: clients.map(clientDto) });
});

/* ================= GET SINGLE CLIENT (ADMIN, OWNER) ================= */
const getClient = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  if (req.user.role === "client" && String(client.userId) !== String(req.user._id)) {
    throw notFound("Client not found");
  }
  await client.populate("userId", USER_FIELDS);
  return res.json({ success: true, client: clientDto(client) });
});

/* ================= GET LOGGED-IN CLIENT ================= */
const getMyClient = asyncHandler(async (req, res) => {
  const client = await getOwnClient(req);
  await client.populate("userId", USER_FIELDS);
  return res.json({ success: true, client: clientDto(client) });
});

/* ================= UPDATE CLIENT (ADMIN) ================= */
const updateClient = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const body = req.body || {};
  const update = {};
  if (body.budget !== undefined && body.budget !== "") {
    update.budget = toFiniteNumber(body.budget, "budget", { min: 0, max: 1e12 });
  }
  if (body.planType !== undefined && body.planType !== "") {
    update.planType = requireEnum(body.planType, PLAN_TYPES, "planType");
  }
  if (req.file?.buffer) {
    update.companyLogo = await uploadToImageKit(req.file, "clients");
  }
  update.updatedAt = new Date();

  const updated = await Client.findByIdAndUpdate(client._id, { $set: update }, { returnDocument: "after" })
    .populate("userId", USER_FIELDS);
  return res.json({ success: true, message: "Client updated", client: clientDto(updated) });
});

/* ================= DELETE CLIENT (ADMIN) ================= */
const deleteClient = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const images = await ClientGalleryImage.find({ clientId: client._id }).select("fileId").lean();

  await Promise.all([
    ClientRosterEntry.deleteMany({ clientId: client._id }),
    ClientGalleryImage.deleteMany({ clientId: client._id }),
    ClientStanding.deleteMany({ clientId: client._id }),
  ]);
  await User.findByIdAndDelete(client.userId);
  await Client.findByIdAndDelete(client._id);

  await Promise.all(images.map((img) => deleteFromImageKit(img.fileId)));
  return res.json({ success: true, message: "Client deleted" });
});

/* ================= LEGACY: PERFORMANCE / IMAGES ================= */
// GET /client/performance  (client: own; admin: ?userId=). No sample data: [] until entered.
const getClientPerformance = asyncHandler(async (req, res) => {
  const client = await resolveLegacyClient(req);
  const { standings, updatedAt } = await loadStandings(client._id);
  return res.json({ success: true, performance: standings, updatedAt });
});

// GET /client/images  (client: own; admin: ?userId=). `images` stays an array of URLs (web shape).
const getClientImages = asyncHandler(async (req, res) => {
  const client = await resolveLegacyClient(req);
  const images = await loadGallery(client._id);
  return res.json({ success: true, images: images.map((i) => i.url), items: images.map(galleryDto) });
});

/* ================= CLIENT SELF-SERVICE ================= */
const getMyRoster = asyncHandler(async (req, res) => {
  const client = await getOwnClient(req);
  const entries = await ClientRosterEntry.find({ clientId: client._id }).sort({ createdAt: -1 }).limit(ROSTER_MAX_ENTRIES).lean();
  return res.json({ success: true, entries: entries.map(rosterDto) });
});

const addMyRosterEntry = asyncHandler(async (req, res) => {
  const client = await getOwnClient(req);
  const name = trimmedString(req.body?.name, "name", { max: ROSTER_NAME_MAX });
  const jerseySize = requireEnum(
    typeof req.body?.jerseySize === "string" ? req.body.jerseySize.trim().toUpperCase() : req.body?.jerseySize,
    JERSEY_SIZES,
    "jerseySize"
  );
  const count = await ClientRosterEntry.countDocuments({ clientId: client._id });
  if (count >= ROSTER_MAX_ENTRIES) {
    throw conflict(`Roster is limited to ${ROSTER_MAX_ENTRIES} entries`, "CONFLICT");
  }
  const entry = await ClientRosterEntry.create({ clientId: client._id, name, jerseySize, createdBy: req.user._id });
  return res.status(201).json({ success: true, entry: rosterDto(entry) });
});

const deleteMyRosterEntry = asyncHandler(async (req, res) => {
  const client = await getOwnClient(req);
  const entryId = requireObjectId(req.params.entryId, "entryId");
  const deleted = await ClientRosterEntry.findOneAndDelete({ _id: entryId, clientId: client._id });
  if (!deleted) throw notFound("Roster entry not found");
  return res.json({ success: true });
});

const getMyGallery = asyncHandler(async (req, res) => {
  const client = await getOwnClient(req);
  const images = await loadGallery(client._id);
  return res.json({ success: true, images: images.map(galleryDto) });
});

const getMyPerformance = asyncHandler(async (req, res) => {
  const client = await getOwnClient(req);
  const { standings, updatedAt } = await loadStandings(client._id);
  return res.json({ success: true, standings, updatedAt });
});

/* ================= ADMIN: CLIENT GALLERY ================= */
const getClientGallery = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const images = await loadGallery(client._id);
  return res.json({ success: true, images: images.map(galleryDto) });
});

const addClientGalleryImage = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const caption = trimmedString(req.body?.caption, "caption", { max: GALLERY_CAPTION_MAX, optional: true }) || "";
  if (!req.file?.buffer) throw badRequest("image file is required");
  const count = await ClientGalleryImage.countDocuments({ clientId: client._id });
  if (count >= GALLERY_MAX_IMAGES) throw conflict(`Gallery is limited to ${GALLERY_MAX_IMAGES} images`, "CONFLICT");

  const stored = await uploadToImageKit(req.file, "client-gallery", { returnDetails: true });
  if (!stored?.url) throw badRequest("image file is required");
  let image;
  try {
    image = await ClientGalleryImage.create({
      clientId: client._id,
      url: stored.url,
      fileId: stored.fileId,
      filePath: stored.filePath,
      caption,
      uploadedBy: req.user._id,
    });
  } catch (err) {
    await deleteFromImageKit(stored.fileId);
    throw err;
  }
  return res.status(201).json({ success: true, image: galleryDto(image) });
});

const deleteClientGalleryImage = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const imageId = requireObjectId(req.params.imageId, "imageId");
  const image = await ClientGalleryImage.findOneAndDelete({ _id: imageId, clientId: client._id });
  if (!image) throw notFound("Image not found");
  await deleteFromImageKit(image.fileId);
  return res.json({ success: true });
});

/* ================= ADMIN: CLIENT PERFORMANCE ================= */
const getClientPerformanceAdmin = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const { standings, updatedAt } = await loadStandings(client._id);
  return res.json({ success: true, standings, updatedAt });
});

const nonNegativeInt = (v, field) => {
  const n = toFiniteNumber(v, field, { min: 0, max: MAX_STAT });
  if (!Number.isInteger(n)) throw badRequest(`${field} must be a non-negative integer`);
  return n;
};

const putClientPerformance = asyncHandler(async (req, res) => {
  const client = await getClientById(req.params.id);
  const rows = req.body?.standings;
  if (!Array.isArray(rows)) throw badRequest("standings must be an array");
  if (rows.length > STANDINGS_MAX_ROWS) throw badRequest(`standings is limited to ${STANDINGS_MAX_ROWS} rows`);

  const seen = new Set();
  const standings = rows.map((row, i) => {
    if (!row || typeof row !== "object") throw badRequest(`standings[${i}] is invalid`);
    const teamName = trimmedString(row.teamName, `standings[${i}].teamName`, { max: TEAM_NAME_MAX });
    const key = teamName.toLowerCase();
    if (seen.has(key)) throw badRequest(`Duplicate team name: ${teamName}`);
    seen.add(key);
    const played = nonNegativeInt(row.played, `standings[${i}].played`);
    const won = nonNegativeInt(row.won, `standings[${i}].won`);
    const lost = nonNegativeInt(row.lost, `standings[${i}].lost`);
    const points = nonNegativeInt(row.points, `standings[${i}].points`);
    if (won + lost > played) throw badRequest(`standings[${i}]: won + lost cannot exceed played`);
    return { teamName, played, won, lost, points };
  });

  await ClientStanding.findOneAndUpdate(
    { clientId: client._id },
    { $set: { standings, updatedBy: req.user._id } },
    { upsert: true, returnDocument: "after" }
  );
  const result = await loadStandings(client._id);
  return res.json({ success: true, ...result });
});

export {
  addClient,
  getClients,
  getClient,
  getMyClient,
  updateClient,
  deleteClient,
  getClientPerformance,
  getClientImages,
  getMyRoster,
  addMyRosterEntry,
  deleteMyRosterEntry,
  getMyGallery,
  getMyPerformance,
  getClientGallery,
  addClientGalleryImage,
  deleteClientGalleryImage,
  getClientPerformanceAdmin,
  putClientPerformance,
};
