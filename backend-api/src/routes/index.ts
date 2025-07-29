import { Router } from "express";

const router = Router();

// Test endpoint to verify API is working
router.get("/test", (req, res) => {
  res.json({
    message: "Moqqins API is working perfectly!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Projects endpoints (mock data for now)
router.post("/projects", (req, res) => {
  try {
    const { name, figma_file_id, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: "Project name is required",
      });
    }

    // Create mock project (we'll use database tomorrow)
    const project = {
      id: "proj_" + Date.now(),
      name: name,
      figma_file_id: figma_file_id || null,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version_count: 0,
    };

    console.log("Created project:", project);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      error: "Failed to create project",
      message: (error as Error).message,
    });
  }
});

// Get all projects
router.get("/projects", (req, res) => {
  try {
    // Mock projects list (we'll get from database tomorrow)
    const projects = [
      {
        id: "proj_123",
        name: "Mobile App Redesign",
        figma_file_id: "figma_123",
        description: "Complete redesign of our mobile application",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-16T15:30:00Z",
        version_count: 5,
      },
      {
        id: "proj_124",
        name: "Website Landing Page",
        figma_file_id: "figma_124",
        description: "New landing page for product launch",
        created_at: "2024-01-16T14:30:00Z",
        updated_at: "2024-01-17T09:15:00Z",
        version_count: 3,
      },
    ];

    res.json({
      projects: projects,
      total: projects.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      error: "Failed to fetch projects",
      message: (error as Error).message,
    });
  }
});

// Get single project by ID
router.get("/projects/:id", (req, res) => {
  try {
    const { id } = req.params;

    // Mock project data (we'll get from database tomorrow)
    const project = {
      id: id,
      name: "Mock Project",
      figma_file_id: "figma_" + id,
      description: "This is a mock project for testing",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: new Date().toISOString(),
      version_count: 2,
    };

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      error: "Failed to fetch project",
      message: (error as Error).message,
    });
  }
});

// Versions endpoints (mock data for now)
router.post("/projects/:projectId/versions", (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, author, document_data } = req.body;

    // Create mock version
    const version = {
      id: "ver_" + Date.now(),
      project_id: projectId,
      version_number: 1,
      message: message || "Version created",
      author: author || "Anonymous User",
      document_data: document_data || null,
      created_at: new Date().toISOString(),
    };

    console.log("Created version:", version);
    res.status(201).json(version);
  } catch (error) {
    console.error("Error creating version:", error);
    res.status(500).json({
      error: "Failed to create version",
      message: (error as Error).message,
    });
  }
});

// Get versions for a project
router.get("/projects/:projectId/versions", (req, res) => {
  try {
    const { projectId } = req.params;

    // Mock versions list
    const versions = [
      {
        id: "ver_001",
        project_id: projectId,
        version_number: 2,
        message: "Updated button colors and spacing",
        author: "Sarah Designer",
        created_at: "2024-01-17T15:30:00Z",
      },
      {
        id: "ver_002",
        project_id: projectId,
        version_number: 1,
        message: "Initial design version",
        author: "Mike Designer",
        created_at: "2024-01-15T10:00:00Z",
      },
    ];

    res.json({
      versions: versions,
      total: versions.length,
      project_id: projectId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching versions:", error);
    res.status(500).json({
      error: "Failed to fetch versions",
      message: (error as Error).message,
    });
  }
});

export default router;
