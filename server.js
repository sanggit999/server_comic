const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/assignment", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

////////////////////////PHẦN ĐỊNH NGHĨA SCHEMA///////////////////////////

//Schema Comic;
const comicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    collection: "comic",
  }
);
//Model Comic;
const Comic = mongoose.model("Comic", comicSchema);

//Schema User;
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      enum: [1, 2], // 1: user, 2: admin
    },
  },
  {
    collection: "user",
  }
);
//Model User;
const User = mongoose.model("User", userSchema);

//Schema Comment;
const commentSchema = new mongoose.Schema(
  {
    comicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "comment",
  }
);
//Model Comment;
const Comment = mongoose.model("Comment", commentSchema);

////////////////////////////PHẦN ĐỊNH NGHĨA ROUTE////////////////////////////////////////

////////////COMIC////////////;

// Endpoint GET: Lấy danh sách truyện;
app.get("/comics", async (req, res) => {
  try {
    const comics = await Comic.find();
    res.json(comics);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách truyện" });
  }
});

// Endpoint GET: Lấy thông tin chi tiết truyện;
app.get("/comics/:id", async (req, res) => {
  const comicId = req.params.id;
  try {
    const comic = await Comic.findById(comicId);
    if (comic) {
      res.json(comic);
    } else {
      res.status(404).json({ error: "Không tìm thấy truyện" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy thông tin truyện" });
  }
});

// Endpoint POST: Tạo mới truyện;
app.post("/comics", async (req, res) => {
  const { title, description, author, year, coverImage, images } = req.body;
  try {
    const comic = new Comic({
      title,
      description,
      author,
      year,
      coverImage,
      images,
    });
    await comic.save();
    res.json(comic);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo mới truyện" });
  }
});

// Endpoint PUT: Cập nhật thông tin truyện;
app.put("/comics/:id", async (req, res) => {
  const comicId = req.params.id;
  const { title, description, author, year, coverImage } = req.body;
  try {
    const comic = await Comic.findByIdAndUpdate(
      comicId,
      { title, description, author, year, coverImage},
      { new: true }
    );
    if (comic) {
      res.json(comic);
    } else {
      res.status(404).json({ error: "Không tìm thấy truyện" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật truyện" });
  }
});

// Endpoint DELETE: Xóa truyện;
app.delete("/comics/:id", async (req, res) => {
  const comicId = req.params.id;
  try {
    const comic = await Comic.findByIdAndDelete(comicId);
    if (comic) {
      res.json({ message: "Xóa truyện thành công" });
    } else {
      res.status(404).json({ error: "Không tìm thấy truyện" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa truyện" });
  }
});

////////////USER////////////////;

// Endpoint GET: Lấy danh sách người dùng;
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách người dùng" });
  }
});

// Endpoint GET: Lấy thông tin chi tiết người dùng;
app.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy thông tin người dùng" });
  }
});

// Endpoint POST: Tạo mới người dùng với vai trò "user" mặc định;
app.post("/users/user", async (req, res) => {
  const { username, password, email, fullname } = req.body;
  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      // Username đã tồn tại;
      res.json({ exists: true });
    } else {
      const newUser = new User({
        username,
        password,
        email,
        fullname,
        role: 1,
      });
      const savedUser = await newUser.save();
      res.json({ exists: false, savedUser }); // false là chưa có username thì đăng ký;
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo mới người dùng" });
  }
});

// Endpoint POST: Tạo mới người dùng với vai trò "admin" mặc định;
app.post("/users/admin", async (req, res) => {
  const { username, password, email, fullname } = req.body;
  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      // Username đã tồn tại;
      res.json({ exists: true });
    } else {
      // Tạo người dùng mới;
      const newUser = new User({
        username,
        password,
        email,
        fullname,
        role: 2,
      });
      const savedUser = await newUser.save();
      res.json({ exists: false, savedUser }); // false là chưa có username thì đăng ký;
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi tạo mới người dùng" });
  }
});


// Endpoint POST: Đăng nhập
app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      if (user.password === password) {
        // Mật khẩu đúng
        if (user.role === 1) {
          res.json({
            exists: true,
            _id:user._id,// Thêm trường "_id" vào phản hồi;
            role: 1,
            fullname: user.fullname,
            email: user.email,
            message: "Đăng nhập thành công",
          });
        } else if (user.role === 2) {
          res.json({
            exists: true,
            role: 2,
            _id:user._id,// Thêm trường "_id" vào phản hồi;
            fullname: user.fullname,
            email: user.email,
            message: "Đăng nhập thành công",
          });
        }
      } else {
        // Mật khẩu không đúng
        res.json({
          exists: true,
          message: "Đăng nhập không thành công",
          error: "Mật khẩu không đúng",
        });
      }
    } else {
      // Tài khoản không tồn tại
      res.json({
        exists: false,
        message: "Tài khoản không tồn tại",
        error: "Tài khoản không tồn tại",
      });
    }
  } catch (error) {
    // Lỗi đăng nhập
    res.status(500).json({ error: "Lỗi đăng nhập" });
  }
});


// Endpoint PUT: Cập nhật thông tin người dùng;
app.put("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { username, password, email, fullname, role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { username, password, email, fullname, role },
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật người dùng" });
  }
});

// Endpoint DELETE: Xóa người dùng;
app.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (user) {
      res.json({ message: "Xóa người dùng thành công" });
    } else {
      res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa người dùng" });
  }
});

////////////COMMENT////////////////;

// Endpoint GET: Lấy danh sách bình luận theo comicId và userId;
app.get("/comments/comic/:comicId/user/:userId", async (req, res) => {
  const comicId = req.params.comicId;
  const userId = req.params.userId;
  
  try {
    // Kiểm tra xem có trùng khớp giữa comicId và userId trong cơ sở dữ liệu hay không
    const comic = await Comic.findById(comicId);
    const user = await User.findById(userId);
    if (!comic || !user) {
      return res.status(404).json({ error: "Không tìm thấy truyện hoặc người dùng" });
    }

    // Lấy danh sách bình luận
    const comments = await Comment.find({ comicId: comicId, userId: userId });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách bình luận" });
  }
});




// Endpoint GET: Lấy danh sách bình luận theo vai trò (role) và comicId;
app.get("/comments/:comicId", async (req, res) => {
  const comicId = req.params.comicId;
  const userId = req.header("userId"); // Lấy userId từ header của request

  try {
    if (!userId) {
      return res.status(400).json({ error: "Thiếu thông tin userId" });
    }

    // Lấy thông tin người dùng dựa trên userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    // Kiểm tra vai trò của người dùng (role = 1 là người dùng, role = 2 là admin)
    if (user.role === 1) {
      // Lấy danh sách bình luận của người dùng (role = 1) dựa trên comicId
      const comments = await Comment.find({ comicId, userId });
      res.json(comments);
    } else if (user.role === 2) {
      // Lấy danh sách bình luận của admin (role = 2) dựa trên comicId
      const comments = await Comment.find({ comicId });
      res.json(comments);
    } else {
      return res.status(400).json({ error: "Vai trò (role) không hợp lệ" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách bình luận" });
  }
});




// Endpoint POST: Gửi bình luận cho truyện
app.post("/comments", async (req, res) => {
  const { comicId, userId, content } = req.body;
  try {
    // Kiểm tra xem có tồn tại người dùng và truyện với các ID được cung cấp hay không
    const user = await User.findById(userId);
    const comic = await Comic.findById(comicId);

    if (!user || !comic) {
      res.status(404).json({ error: "Người dùng hoặc truyện không tồn tại" });
    } else {
      const comment = new Comment({
        comicId,
        userId,
        content,
      });

      await comment.save();

      res.json(comment);
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi gửi bình luận" });
  }
});



// Endpoint PUT: Sửa nội dung bình luận
app.put("/comments/:id", async (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;
  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );
    if (comment) {
      res.json(comment);
    } else {
      res.status(404).json({ error: "Không tìm thấy bình luận" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi sửa bình luận" });
  }
});



// Endpoint DELETE: Xóa bình luận
app.delete("/comments/:id", async (req, res) => {
  const commentId = req.params.id;
  try {
    const comment = await Comment.findByIdAndDelete(commentId);
    if (comment) {
      res.json({ message: "Xóa bình luận thành công" });
    } else {
      res.status(404).json({ error: "Không tìm thấy bình luận" });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi xóa bình luận" });
  }
});




const port = 3000;
app.listen(port, () => console.log(`Server đang chạy trên port ${port}`));
