const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const tweets_data = require("./tweets.json");
const fs = require("fs");
const request = require("request");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getTitleTransformation = (title) => {
  return [
    {
      overlay: {
        font_family: "Arial",
        font_size: 90,
        font_style: "italic",
        text: title,
        line_spacing: 20,
      },
      color: "#f8f8ff",
      crop: "fit",
      width: 2500,
    },
  ];
};

const generateImage = async (title) => {
  const titleTransformation = getTitleTransformation(title);
  const url = cloudinary.url("mainbg", {
    transformation: [...titleTransformation],
  });
  return url;
};

const deleteTopTweet = (path) => {
  const tweets = JSON.parse(fs.readFileSync(`./${path}`));
  const Index = 0;
  tweets.splice(Index, 1);

  fs.writeFileSync(path, JSON.stringify(tweets, 0, 4), "utf8");
};

var download = function (uri, filename, callback) {
  request.head(uri, function () {
    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};

const uploadImage = async (imagePath) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    await cloudinary.uploader.upload(imagePath, options);
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  if (tweets_data.length > 0) {
    const url = await generateImage(tweets_data[0].Tweet);
    download(url, "next_post.png", function () {
      console.log("Image Downloaded");
    });
    setTimeout(async () => {
      await uploadImage("next_post.png");
      console.log("Image Uploaded");
    }, 10000);
    deleteTopTweet("tweets.json");
  } else {
    console.log("No tweets found");
  }
})();
