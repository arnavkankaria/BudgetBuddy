const app = express();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});