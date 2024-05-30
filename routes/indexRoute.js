const userRouter = require("./userRoute");
const authRouter = require("./authRoute");
const taskRouter = require("./taskRoute");

const allRoutes = [
  ["/users", userRouter],
  ["/auths", authRouter],
  ["/tasks", taskRouter],
];

const router = (app) => {
  allRoutes.forEach((route) => {
    const [path, router] = route;
    app.use(`/api${path}`, router);
  });
};

module.exports = router;
