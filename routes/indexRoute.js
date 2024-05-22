const userRouter = require("./userRoute");
const authRouter = require("./authRoute");
const taskRouter = require("./taskRoute");

const allRoutes = [
  ["/user", userRouter],
  ["/auth", authRouter],
  ["/task", taskRouter],
];

const router = (app) => {
  allRoutes.forEach((route) => {
    const [path, router] = route;
    app.use(`/api/v1${path}`, router);
  });
};

module.exports = router;
