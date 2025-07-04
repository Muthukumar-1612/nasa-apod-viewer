import express from "express";
import axios from "axios";

const port = 3000;
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Show today's APOD by default
app.get("/", async (req, res) => {
    try {
        const response = await axios.get("https://api.nasa.gov/planetary/apod", {
            params: {
                api_key: "DEMO_KEY",
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

        res.render("index.ejs", {
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
        console.error(error);
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
                api_key: "DEMO_KEY",
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

        res.render("index.ejs", {
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
        console.error(error);
        res.send("Error fetching APOD data.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
