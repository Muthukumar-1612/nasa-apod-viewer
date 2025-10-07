import express from "express";
import axios from "axios";
import env from "dotenv";
env.config();

const port = process.env.PORT || 3000;
const app = express();
const API_KEY = process.env.API_KEY;
console.log("API_KEY:", API_KEY);


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Show today's APOD by default
app.get("/", async (req, res) => {
    try {
        const response = await axios.get("https://api.nasa.gov/planetary/apod", {
            params: {
                api_key: API_KEY,
                thumbs: true
            }
        });

        const data = response.data;

        let imageUrl = "";
        if (data.media_type === "image") {
            imageUrl = data.url;
        } else if (data.media_type === "video") {
            imageUrl = data.thumbnail_url;
        }

        res.render("index", {
            data: {
                title: data.title,
                date: data.date,
                explanation: data.explanation,
                mediaType: data.media_type,
                imageUrl: imageUrl,
                videoUrl: data.url,
                copyright: data.copyright
            }
        });
    } catch (error) {
        if (error.response) {
            console.error("NASA API error:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
        res.send("Error fetching APOD data.");
    }
});

// Handle form POST to search by date
app.post("/", async (req, res) => {
    const { year, month, day } = req.body;
    const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    try {
        const response = await axios.get("https://api.nasa.gov/planetary/apod", {
            params: {
                api_key: API_KEY,
                date: date,
                thumbs: true
            }
        });

        const data = response.data;

        let imageUrl = "";
        if (data.media_type === "image") {
            imageUrl = data.url;
        } else if (data.media_type === "video") {
            imageUrl = data.thumbnail_url;
        }

        res.render("index", {
            data: {
                title: data.title,
                date: data.date,
                explanation: data.explanation,
                mediaType: data.media_type,
                imageUrl: imageUrl,
                videoUrl: data.url,
                copyright: data.copyright
            }
        });
    } catch (error) {
        if (error.response) {
            console.error("NASA API error:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
        res.send("Error fetching APOD data.");
    }
});

// health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
