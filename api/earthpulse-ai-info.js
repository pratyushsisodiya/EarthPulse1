const site = {
  name: "EarthPulse",
  version: "ai-agent-ready-1",
  canonical: "https://earthpulse1.vercel.app/",
  description: "Earth intelligence for climate, weather, seismic activity, atmosphere, oceans and space weather.",
  crawl: {
    robots: "https://earthpulse1.vercel.app/robots.txt",
    sitemap: "https://earthpulse1.vercel.app/sitemap.xml",
    llms: "https://earthpulse1.vercel.app/llms.txt"
  },
  test: "https://earthpulse1.vercel.app/ai-test.html",
  pages: [
    "/",
    "/data.html",
    "/analytics.html",
    "/planet-pulse.html",
    "/earthquakes.html",
    "/space-weather.html",
    "/air-quality.html",
    "/mission.html",
    "/whats-new.html"
  ],
  capabilities: [
    "earth observation",
    "environmental monitoring",
    "climate context",
    "weather context",
    "seismic activity",
    "air quality",
    "natural events",
    "space weather",
    "interactive Earth visualization",
    "AI-assisted explanations"
  ],
  guidance: [
    "Treat live measurements as time-dependent observations.",
    "Separate observed data from inference and scientific explanation.",
    "Do not invent unavailable measurements or sources.",
    "Use the canonical URLs above when citing EarthPulse."
  ]
};

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({error:"Method not allowed."});
  }
  return res.status(200).json(site);
};
