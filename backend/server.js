require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: có thể giới hạn domain frontend bằng biến môi trường CORS_ORIGIN
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// ---------- Schema ----------
const STATUSES = ["Đang sử dụng", "Hư hỏng", "Đang sửa chữa", "Ngừng sử dụng"];

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "Mã thiết bị là bắt buộc"],
      unique: true,
      trim: true,
    },
    name: { type: String, required: [true, "Tên thiết bị là bắt buộc"], trim: true },
    deviceType: { type: String, required: [true, "Loại thiết bị là bắt buộc"], trim: true },
    room: { type: String, required: [true, "Phòng học là bắt buộc"], trim: true },
    brand: { type: String, trim: true, default: "" },
    model: { type: String, trim: true, default: "" },
    quantity: {
      type: Number,
      required: [true, "Số lượng là bắt buộc"],
      min: [0, "Số lượng phải lớn hơn hoặc bằng 0"],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: "Tình trạng không hợp lệ" },
      default: "Đang sử dụng",
    },
    purchaseDate: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Ngày mua phải có dạng YYYY-MM-DD"],
      default: "",
    },
    description: { type: String, trim: true, default: "" },
  },
  { collection: "devices", versionKey: false }
);

const Device = mongoose.model("Device", deviceSchema);

// ---------- Hàm hỗ trợ ----------
const FIELDS = [
  "deviceId", "name", "deviceType", "room", "brand",
  "model", "quantity", "status", "purchaseDate", "description",
];

function pickFields(body) {
  const data = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  return data;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function handleError(err, res) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: messages });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Mã thiết bị (deviceId) đã tồn tại" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Dữ liệu hoặc ID không hợp lệ" });
  }
  console.error(err);
  return res.status(500).json({ message: "Lỗi máy chủ" });
}

// ---------- Health check ----------
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "error",
    database: connected ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

// Nếu chưa kết nối được database thì các API trả về 503
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Không kết nối được cơ sở dữ liệu" });
  }
  next();
});

// ---------- API thiết bị ----------
// Lấy danh sách + tìm kiếm: GET /api/devices?search=projector
app.get("/api/devices", async (req, res) => {
  try {
    const filter = {};
    const keyword = (req.query.search || "").trim();
    if (keyword) {
      const regex = new RegExp(escapeRegex(keyword), "i");
      filter.$or = [
        { deviceId: regex },
        { name: regex },
        { deviceType: regex },
        { room: regex },
      ];
    }
    const devices = await Device.find(filter).sort({ deviceId: 1 });
    res.json(devices);
  } catch (err) {
    handleError(err, res);
  }
});

// Xem một thiết bị
app.get("/api/devices/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json(device);
  } catch (err) {
    handleError(err, res);
  }
});

// Thêm thiết bị
app.post("/api/devices", async (req, res) => {
  try {
    const device = await Device.create(pickFields(req.body));
    res.status(201).json(device);
  } catch (err) {
    handleError(err, res);
  }
});

// Cập nhật thiết bị
app.put("/api/devices/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const device = await Device.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json(device);
  } catch (err) {
    handleError(err, res);
  }
});

// Xóa thiết bị
app.delete("/api/devices/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    res.json({ message: "Đã xóa thiết bị" });
  } catch (err) {
    handleError(err, res);
  }
});

// Đường dẫn không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy đường dẫn" });
});

// ---------- Khởi động ----------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err.message));

app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));