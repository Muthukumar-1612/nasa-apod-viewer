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

// Helper function to fetch APOD safely
async function fetchAPOD(date = null) {
    try {
        const response = await axios.get("https://api.nasa.gov/planetary/apod", {
            params: {
                api_key: API_KEY,
                thumbs: true,
                ...(date && { date })
            },
            timeout: 8000 // 8 seconds timeout
        });

        // Check if we got valid JSON
        const data = response.data;
        if (!data || !data.url) throw new Error("Invalid APOD response.");

        let imageUrl = "";
        if (data.media_type === "image") imageUrl = data.url;
        else if (data.media_type === "video") imageUrl = data.thumbnail_url;

        return {
            title: data.title,
            date: data.date,
            explanation: data.explanation,
            mediaType: data.media_type,
            imageUrl: imageUrl,
            videoUrl: data.url,
            copyright: data.copyright
        };

    } catch (error) {
        console.error("NASA API unavailable or returned error:", error.message);
        // Return fallback data
        return {
            title: "NASA APOD Temporarily Unavailable",
            date: new Date().toISOString().split("T")[0],
            explanation: "Due to a lapse in U.S. government funding, NASA's API is currently offline. Please check back later!",
            mediaType: "image",
            imageUrl: "/images/404.jpg",
            videoUrl: "",
            copyright: "NASA"
        };
    }
}

// Routes

// Show today's APOD by default
app.get("/", async (req, res) => {
    const data = await fetchAPOD();
    res.render("index", { data });
});

// Handle form POST to search by date
app.post("/", async (req, res) => {
    const { year, month, day } = req.body;
    const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const data = await fetchAPOD(date);
    res.render("index", { data });
});

// health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
    console.log(` Server running on port: ${port}`);
});
