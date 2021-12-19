const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dev",
});
connection.connect();
app.post("/login", (req, res) => {
  const body = req.body;
  const username = body.username;
  const password = body.password;
  connection.query(
    `SELECT * FROM user WHERE username = '${username}'`,
    function (error, results) {
      if (error) throw error;
      const data = results[0];
      if (!data) {
        return res.send(`${username} Chua tồn tại`);
      }
      const IsPass = bcrypt.compareSync(password, data.password);
      if (!IsPass) return res.send(`${username} Sai mật khẩu`);
      const accessToken = jwt.sign(
        {
          id: data.id,
        },
        "1234",
        { expiresIn: 60 * 60 }
      );
      const refreshToken = jwt.sign(
        {
          id: data.id,
        },
        "12345",
        { expiresIn: 60 * 60 * 24 * 30 }
      );
      connection.query(
        `UPDATE user SET refreshToken  = '${refreshToken}' WHERE id =${data.id}`,
        (err3) => {
          if (err3) throw error;

          res.send({
            accessToken,
            refreshToken,
          });
        }
      );
    }
  );
});

app.post("/reg", (req, res) => {
  const body = req.body;
  const username = body.username;
  const password = body.password;
  connection.query(
    `SELECT * FROM user WHERE username = '${username}'`,
    function (error, results, fields) {
      if (error) throw error;
      const data = results[0];
      if (data) {
        return res.send(`${username} Đã tồn tại`);
      }
      const passwordHash = bcrypt.hashSync(password, 10);
      connection.query(
        `INSERT INTO user (username, password) VALUES ('${username}' ,'${passwordHash}')`,
        function (error2) {
          if (error2) throw error2;
          res.send(`Dang ky thanh cong`);
        }
      );
    }
  );
});

app.listen(3000, () => {
  console.log("Server dang chay");
});
