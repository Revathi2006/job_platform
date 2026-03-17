// src/mockData.js
export const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    location: "Remote",
    salary: "$90k - $130k",
    type: "Full-time",
    description: "We are looking for an experienced Frontend Developer...",
    requirements: ["React", "TypeScript", "CSS"],
    postedDate: "2026-03-10",
    applicants: 24
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Design Studio",
    location: "New York",
    salary: "$70k - $100k",
    type: "Full-time",
    description: "Creative UI/UX Designer needed for exciting projects...",
    requirements: ["Figma", "Adobe XD", "User Research"],
    postedDate: "2026-03-12",
    applicants: 18
  },
  {
    id: 3,
    title: "Product Manager",
    company: "Innovation Inc",
    location: "San Francisco",
    salary: "$120k - $160k",
    type: "Full-time",
    description: "Lead product strategy and roadmap...",
    requirements: ["Product Strategy", "Agile", "Leadership"],
    postedDate: "2026-03-09",
    applicants: 12
  },
  {
    id: 4,
    title: "Backend Developer",
    company: "Cloud Solutions",
    location: "Remote",
    salary: "$85k - $120k",
    type: "Full-time",
    description: "Build scalable backend services...",
    requirements: ["Node.js", "Python", "AWS"],
    postedDate: "2026-03-11",
    applicants: 15
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Tech Innovations",
    location: "Austin",
    salary: "$100k - $140k",
    type: "Full-time",
    description: "Manage cloud infrastructure and CI/CD...",
    requirements: ["Kubernetes", "Docker", "Jenkins"],
    postedDate: "2026-03-08",
    applicants: 9
  }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    applicantName: "Sarah Anderson",
    email: "sarah@email.com",
    phone: "+1 555-0123",
    experience: "8 years",
    status: "review",
    appliedDate: "2026-03-13"
  },
  {
    id: 2,
    jobId: 1,
    applicantName: "Michael Chen",
    email: "michael@email.com",
    phone: "+1 555-0124",
    experience: "5 years",
    status: "interview",
    appliedDate: "2026-03-12"
  },
  {
    id: 3,
    jobId: 2,
    applicantName: "Jessica Rodriguez",
    email: "jessica@email.com",
    phone: "+1 555-0125",
    experience: "6 years",
    status: "pending",
    appliedDate: "2026-03-11"
  }
];

export const mockCompanies = [
  {
    id: 1,
    name: "Tech Corp",
    logo: "TC",
    location: "Remote",
    jobs: 5
  },
  {
    id: 2,
    name: "Design Studio",
    logo: "DS",
    location: "New York",
    jobs: 3
  },
  {
    id: 3,
    name: "Innovation Inc",
    logo: "II",
    location: "San Francisco",
    jobs: 4
  }
];