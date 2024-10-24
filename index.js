const express = require("express");
const { PORT } = require("./config");
// require('./middlewares/passport');

const app = express();



require("./server")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
