const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "0.0.0.0";
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const profile = {
  name: "DevOps & Cloud Computing Enthusiast",
  title: "Building scalable, automated, and reliable infrastructure",
  summary:
    "I am passionate about designing production-ready systems that combine software delivery with cloud-native infrastructure, automation, and operational excellence.",
  about: [
    "I focus on scalable, automated, and reliable infrastructure solutions with hands-on experience in Docker, Kubernetes, Jenkins, Linux, CI/CD pipelines, and cloud-based deployment workflows.",
    "My technical experience spans containerization, orchestration, deployment automation, backend integration, and database management using React, Node.js, MySQL, Firebase, and Drizzle ORM.",
    "I continuously explore cloud-native technologies, infrastructure automation, monitoring, and deployment efficiency to grow as a Cloud and DevOps Engineer."
  ],
  highlights: [
    "Containerization and orchestration with Docker and Kubernetes",
    "CI/CD automation and deployment workflow optimization",
    "Backend integration and database-driven applications",
    "Production-minded focus on security, scalability, and reliability"
  ],
  stack: [
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Linux",
    "Node.js",
    "React",
    "MySQL",
    "Firebase",
    "Drizzle ORM",
    "CI/CD"
  ],
  stats: [
    { label: "Core Focus", value: "DevOps" },
    { label: "Primary Goal", value: "Reliable systems" },
    { label: "Engineering Style", value: "Automation first" }
  ]
};

const submissions = [];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 404, { error: "File not found" });
        return;
      }

      sendJson(response, 500, { error: "Unable to read the requested file" });
      return;
    }

    response.writeHead(200, { "Content-Type": contentType });
    response.end(data);
  });
}

function serveStaticAsset(requestUrl, response) {
  const requestedPath = requestUrl === "/" ? "/index.html" : requestUrl;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(response, 403, { error: "Access denied" });
    return;
  }

  sendFile(response, filePath);
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1e6) {
        reject(new Error("Payload too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });

    request.on("error", () => {
      reject(new Error("Request error"));
    });
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/profile") {
    sendJson(response, 200, profile);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/contact") {
    try {
      const payload = await parseRequestBody(request);
      const name = String(payload.name || "").trim();
      const email = String(payload.email || "").trim();
      const message = String(payload.message || "").trim();

      if (!name || !email || !message) {
        sendJson(response, 400, {
          success: false,
          message: "Please complete all fields before submitting."
        });
        return;
      }

      submissions.push({
        name,
        email,
        message,
        submittedAt: new Date().toISOString()
      });

      sendJson(response, 200, {
        success: true,
        message: "Message received. Thanks for reaching out."
      });
    } catch (error) {
      const statusCode = error.message === "Payload too large" ? 413 : 400;

      sendJson(response, statusCode, {
        success: false,
        message: error.message === "Payload too large"
          ? "Message is too large to process."
          : "Unable to process the form submission."
      });
    }

    return;
  }

  if (request.method === "GET") {
    serveStaticAsset(url.pathname, response);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed" });
});

server.listen(port, host, () => {
  console.log(`Portfolio server running at http://${host}:${port}`);
});
