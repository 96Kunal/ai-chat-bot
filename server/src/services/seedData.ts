import { CollegeKnowledge } from '../models/CollegeKnowledge';
import { Event } from '../models/Event';
import { Announcement } from '../models/Announcement';

export const seedInitialData = async (): Promise<void> => {
  try {
    const knowledgeCount = await CollegeKnowledge.countDocuments();
    if (knowledgeCount === 0) {
      console.log('[Seed] Seeding comprehensive College Knowledge Base...');

      const knowledgeItems = [
        // Departments
        {
          category: 'department',
          title: 'Department of Computer Science & Engineering (CSE)',
          tags: ['cse', 'computer science', 'academics', 'coding', 'software'],
          content: `The Department of Computer Science and Engineering is the premier technology division at Horizon Institute of Technology. 
Location: Block A, Floors 2-4. 
Programs Offered: B.Tech in CSE, B.Tech CSE (AI & ML), M.Tech in Software Engineering, Ph.D. 
Key Laboratories: High-Performance Computing Lab, Cloud Architecture Lab, Cyber Security Sandbox, Open-Source Software Studio.
Head of Department: Dr. Sarah Jenkins (Office: Block A, Room 302).`,
          metadata: { block: 'Block A', floor: '3rd Floor', hod: 'Dr. Sarah Jenkins', email: 'hod.cse@horizon.edu' }
        },
        {
          category: 'department',
          title: 'Department of Artificial Intelligence & Data Science (AI & DS)',
          tags: ['ai', 'data science', 'machine learning', 'deep learning', 'python'],
          content: `The Department of AI & Data Science specializes in machine learning, neural networks, Big Data analytics, and generative AI research.
Location: Block C, 3rd Floor.
Labs: NVIDIA GPU Compute Cluster Lab, Robotics & Vision Lab, Data Engineering Lab.
Head of Department: Dr. Arvind Kumar (Office: Block C, Room 310).`,
          metadata: { block: 'Block C', floor: '3rd Floor', hod: 'Dr. Arvind Kumar', email: 'hod.aids@horizon.edu' }
        },
        {
          category: 'department',
          title: 'Department of Electronics & Communication Engineering (ECE)',
          tags: ['ece', 'electronics', 'circuits', 'iot', 'embedded systems', 'vlsi'],
          content: `Focuses on VLSI design, Embedded Systems, IoT, Digital Signal Processing, and Wireless Communications.
Location: Block B, 2nd Floor.
Labs: VLSI Cadence Design Lab, IoT & Sensor Tech Lab, Microwave & Antenna Lab.
Head of Department: Dr. Rajesh Nair (Office: Block B, Room 204).`,
          metadata: { block: 'Block B', floor: '2nd Floor', hod: 'Dr. Rajesh Nair', email: 'hod.ece@horizon.edu' }
        },

        // Faculty
        {
          category: 'faculty',
          title: 'Dr. Sarah Jenkins - Professor & Head of CSE',
          tags: ['faculty', 'professor', 'hod', 'cse', 'algorithms', 'distributed systems'],
          content: `Dr. Sarah Jenkins specializes in Distributed Systems, Cloud Architecture, and Fault-Tolerant Computing.
Office: Block A, Room 302.
Office Hours: Mon, Wed, Fri (2:00 PM - 4:00 PM).
Email: sjenkins@horizon.edu
Courses: CS301 Distributed Systems, CS402 Advanced Cloud Computing.`,
          metadata: { email: 'sjenkins@horizon.edu', office: 'Block A, Room 302', subjects: ['Distributed Systems', 'Cloud Computing'] }
        },
        {
          category: 'faculty',
          title: 'Dr. Arvind Kumar - Lead Researcher & HOD (AI & DS)',
          tags: ['faculty', 'ai', 'ml', 'deep learning', 'neural networks', 'python'],
          content: `Dr. Arvind Kumar is a renowned researcher in Deep Learning, Natural Language Processing, and Reinforcement Learning.
Office: Block C, Room 310.
Office Hours: Tue, Thu (10:00 AM - 1:00 PM).
Email: akumar@horizon.edu
Courses: AI201 Foundations of Machine Learning, AI405 Generative AI Architectures.`,
          metadata: { email: 'akumar@horizon.edu', office: 'Block C, Room 310', subjects: ['Machine Learning', 'Generative AI'] }
        },
        {
          category: 'faculty',
          title: 'Prof. Elena Vance - Associate Professor (Systems & OS)',
          tags: ['faculty', 'os', 'operating systems', 'c programming', 'linux', 'kernel'],
          content: `Prof. Elena Vance teaches Operating Systems, Linux Kernel Internals, and Systems Programming in C/C++.
Office: Block A, Room 215.
Office Hours: Mon to Thu (3:00 PM - 5:00 PM).
Email: evance@horizon.edu
Courses: CS204 Operating Systems, CS101 Fundamentals of C Programming.`,
          metadata: { email: 'evance@horizon.edu', office: 'Block A, Room 215', subjects: ['Operating Systems', 'C Programming'] }
        },
        {
          category: 'faculty',
          title: 'Dr. Marcus Thorne - Data Structures & Algorithms Mentor',
          tags: ['faculty', 'dsa', 'competitive programming', 'data structures', 'algorithms'],
          content: `Dr. Marcus Thorne is the head coach for the Inter-College ICPC Competitive Programming team and leads Data Structures & Algorithms.
Office: Block A, Room 318.
Office Hours: Wed & Fri (11:00 AM - 1:00 PM).
Email: mthorne@horizon.edu
Courses: CS202 Data Structures & Algorithms, CS308 Competitive Programming.`,
          metadata: { email: 'mthorne@horizon.edu', office: 'Block A, Room 318', subjects: ['Data Structures', 'Algorithms'] }
        },

        // Clubs & Communities
        {
          category: 'club',
          title: 'Turing Coding Club (Official Developers & Competitive Programming Guild)',
          tags: ['club', 'coding', 'programming', 'hackathons', 'turing', 'webdev', 'dsa'],
          content: `The Turing Coding Club is the largest tech society on campus.
Activities: Weekly algorithmic challenges, weekend hackathons, open-source sprints, and peer-to-peer web/app development bootcamps.
Meeting Place: Innovation Hub, Lab 3 every Wednesday at 4:30 PM.
Lead Coordinator: Alex Chen (alex.c@student.horizon.edu).
How to Join: Register at portal.horizon.edu/clubs/turing or attend the open orientation at the start of each semester.`,
          metadata: { lead: 'Alex Chen', meetingTime: 'Wednesday 4:30 PM', room: 'Innovation Hub, Lab 3' }
        },
        {
          category: 'club',
          title: 'Zenith AI & Robotics Society',
          tags: ['club', 'ai', 'robotics', 'iot', 'hardware', 'drones', 'automation'],
          content: `Zenith AI & Robotics builds autonomous drones, fighting bots for TechFests, computer vision applications, and IoT smart campus prototypes.
Meeting Time: Saturdays 11:00 AM - 2:00 PM.
Location: Central Robotics Workshop, Ground Floor, Mechanical Block.
Faculty Mentor: Dr. Arvind Kumar.`,
          metadata: { lead: 'Rohan Sharma', meetingTime: 'Saturdays 11:00 AM', room: 'Central Robotics Workshop' }
        },
        {
          category: 'club',
          title: 'Horizon Cultural & Dramatic Society (Aura)',
          tags: ['club', 'cultural', 'drama', 'music', 'dance', 'arts', 'fest'],
          content: `Organizes the annual national cultural fest 'Aura', street plays (Nukkad Natak), musical concerts, and photography exhibitions.
Auditions: Held every August and January in the Central Auditorium.
Contact: cultural.head@horizon.edu.`,
          metadata: { lead: 'Priya Mehta', meetingTime: 'Fridays 5:00 PM', room: 'Central Auditorium Amphitheatre' }
        },
        {
          category: 'club',
          title: 'IEEE & ACM Student Chapters',
          tags: ['club', 'ieee', 'acm', 'research', 'paper writing', 'conferences'],
          content: `Conducts peer-reviewed paper writing workshops, distinguished speaker sessions with global engineers, and international project expos.
Location: Library Conference Room 2.`,
          metadata: { lead: 'David Wright', email: 'ieee.chapter@horizon.edu' }
        },

        // Campus Facilities
        {
          category: 'facility',
          title: 'Central Tech Library & 24/7 Digital Learning Zone',
          tags: ['facility', 'library', 'books', 'study room', 'wifi', 'borrowing'],
          content: `The Central Library spans 4 floors with over 120,000 physical volumes and unlimited IEEE/ACM digital access.
Hours:
- Physical Stacks & Circulation: 8:00 AM - 9:00 PM (Monday - Saturday).
- 24/7 Digital Study Lounge (Floor 1): Open 24x7 with high-speed WiFi, power stations, and silent study cubicles.
Book Borrowing Limit: 5 books per student for 14 days (renewable online via library portal).
Late Fee: $0.20 (or Rs 10) per day per overdue book.`,
          metadata: { hours: '24/7 Study Lounge, Stacks: 8am-9pm', floors: '4 Floors', location: 'Building L' }
        },
        {
          category: 'facility',
          title: 'Campus Food Court & Cafeteria',
          tags: ['facility', 'food', 'cafeteria', 'canteen', 'meals', 'coffee', 'snacks'],
          content: `Multiple dining options located behind Block B:
1. Central Dining Hall: Fresh breakfast (7:30 - 10:00 AM), Lunch (12:00 - 2:30 PM), Dinner (7:30 - 9:30 PM).
2. Tech Cafe & Coffee Bean: 24/7 espresso, sandwiches, pastries, and study snacks.
3. Food Truck Alley: Open 4:00 PM - 11:00 PM with Asian, Mexican, and artisanal pizza.`,
          metadata: { location: 'Behind Block B & Student Center' }
        },
        {
          category: 'facility',
          title: 'Health & Wellness Medical Center',
          tags: ['facility', 'health', 'doctor', 'medical', 'emergency', 'counseling', 'clinic'],
          content: `Free medical consultations, emergency first aid, prescription dispensing, and certified psychological counseling.
Doctor on Duty: 24 Hours.
Location: Ground Floor, Administrative Annex, Room 104.
Emergency Medical Hotline: +1 (555) 019-9111 (Ext. 911 on campus phones).`,
          metadata: { emergencyContact: '+1 (555) 019-9111', location: 'Admin Annex Room 104' }
        },
        {
          category: 'facility',
          title: 'Sports Complex, Swimming Pool & Gymnasium',
          tags: ['facility', 'sports', 'gym', 'gymnasium', 'fitness', 'swimming', 'badminton'],
          content: `Facilities include Olympic-standard swimming pool, indoor badminton & basketball courts, synthetic running track, and gym.
Gym Timings: 6:00 AM - 9:00 AM and 4:30 PM - 9:30 PM daily.
Student ID is required for equipment borrowing and access.`,
          metadata: { location: 'West Campus Sports Pavilion' }
        },

        // Academic Rules & Policies
        {
          category: 'rule',
          title: 'Attendance Policy & Minimum Criteria',
          tags: ['rule', 'policy', 'attendance', 'percentage', 'detention', 'leave'],
          content: `Students are required to maintain a minimum of 75% attendance in both lectures and practical labs for every registered course.
Medical Relaxation: Up to 10% relaxation (i.e. minimum 65%) can be granted upon submitting a verified medical certificate to the Dean of Academics within 7 working days of absence.
Consequence: Students having attendance below 75% (or 65% on approved medical leave) will be detained and barred from writing end-semester examinations for that subject.`,
          metadata: { minAttendance: '75%', medicalRelaxation: '65%' }
        },
        {
          category: 'rule',
          title: 'Grading System & GPA Calculation',
          tags: ['rule', 'policy', 'grades', 'gpa', 'cgpa', 'credits', 'sgpa'],
          content: `Horizon University follows a 10-point relative grading scale:
- O (Outstanding): 10 points (Top 5-10%)
- A+ (Excellent): 9 points
- A (Very Good): 8 points
- B+ (Good): 7 points
- B (Above Average): 6 points
- C (Pass): 5 points
- F (Fail): 0 points (Student must reappear in the supplementary examination).
Minimum CGPA required for graduation and placement eligibility is 6.5.`,
          metadata: { gradingScale: '10.0 scale', minPassGrade: '5.0 (C grade)' }
        },
        {
          category: 'rule',
          title: 'Exam Regulations & Re-evaluation Policy',
          tags: ['rule', 'policy', 'exam', 're-evaluation', 'hall ticket', 'id card', 'cheating'],
          content: `1. College ID Card and official Hall Ticket are mandatory for entering examination halls.
2. Electronic devices, smart watches, and unauthorized material are strictly prohibited (results in immediate disciplinary committee inquiry and semester cancellation).
3. Re-evaluation: Students may apply for answer script re-evaluation or scrutiny within 15 days of result declaration via the student portal with a nominal fee of $15 per subject.`,
          metadata: { reEvaluationWindowDays: 15 }
        },

        // Important Contacts
        {
          category: 'contact',
          title: 'Emergency, Administrative & IT Helpdesk Contacts',
          tags: ['contact', 'emergency', 'helpdesk', 'dean', 'exam', 'placement', 'security', 'phone'],
          content: `Key campus contacts:
- Campus Security & Emergency 24/7: +1 (555) 019-9110 (Ext. 100)
- Campus Medical Center / Ambulance: +1 (555) 019-9111 (Ext. 911)
- Dean of Academic Affairs: dean.academic@horizon.edu | Ext. 201
- Controller of Examinations (COE): exam.cell@horizon.edu | Ext. 205
- Training & Placement Officer (TPO): placements@horizon.edu | Ext. 310
- Central IT & Campus WiFi Helpdesk: it.support@horizon.edu | Ext. 404
- Anti-Ragging & Student Grievance Committee: grievance@horizon.edu | +1 (555) 019-9999`,
          metadata: { emergency: '+1 (555) 019-9110', itSupport: 'it.support@horizon.edu' }
        },

        // Curriculum Guides & Exam Prep
        {
          category: 'curriculum',
          title: 'C Programming & Systems Fundamentals Exam Guide',
          tags: ['curriculum', 'c', 'programming', 'pointers', 'memory', 'exam', 'study'],
          content: `Core topics to study for CS101 C Programming Exam:
1. Pointers & Memory Management: Pointer arithmetic, dynamic memory allocation (\`malloc\`, \`calloc\`, \`realloc\`, \`free\`), double pointers, pointers to functions.
2. Data Structures in C: Structs, Unions, Typedef, Linked List creation and traversal.
3. Arrays & Strings: Multi-dimensional arrays, string manipulation functions (\`strlen\`, \`strcpy\`, \`strcat\`, \`strcmp\`), buffer overflow safety.
4. Preprocessors & File I/O: Macros, conditional compilation (\`#ifdef\`), file pointers (\`fopen\`, \`fread\`, \`fwrite\`, \`fprintf\`, \`fclose\`).
5. Common Exam Questions: Swap using pointers, reversing a linked list, memory leak detection, dynamic 2D array allocation.`,
          metadata: { courseCode: 'CS101', subject: 'C Programming' }
        },
        {
          category: 'curriculum',
          title: 'Data Structures & Algorithms (DSA) Exam Guide',
          tags: ['curriculum', 'dsa', 'algorithms', 'trees', 'graphs', 'sorting', 'time complexity'],
          content: `Core topics for CS202 DSA Exam:
1. Asymptotic Analysis: Big-O, Big-Omega, Big-Theta notation, recurrence relations (Master Theorem).
2. Trees & BSTs: Binary search trees, AVL Tree rotations, Red-Black tree properties, Tree traversals (Inorder, Preorder, Postorder, BFS).
3. Graph Algorithms: BFS, DFS, Dijkstra's Shortest Path, Bellman-Ford, Prim's and Kruskal's MST, Topological Sort.
4. Dynamic Programming: 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Coin Change.
5. Sorting & Searching: Quicksort partitioning, Mergesort, Heap sort, Binary search variations.`,
          metadata: { courseCode: 'CS202', subject: 'Data Structures & Algorithms' }
        }
      ];

      await CollegeKnowledge.insertMany(knowledgeItems);
      console.log(`[Seed] Inserted ${knowledgeItems.length} knowledge items.`);
    }

    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('[Seed] Seeding upcoming Campus Events...');
      const now = new Date();
      const events = [
        {
          title: 'Horizon HackSprint 2026 - 36-Hour National Hackathon',
          description: 'Build futuristic AI, Web3, and IoT solutions with $10,000+ in total prizes. Mentorship from Google, Microsoft, and top startup founders.',
          category: 'Hackathon',
          date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // in 4 days
          time: 'Friday 9:00 AM - Saturday 9:00 PM',
          venue: 'Auditorium Main Hall & Tech Innovation Lab',
          organizer: 'Turing Coding Club & Department of CSE',
          bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          registrationLink: 'https://hacksprint2026.devpost.com',
          rsvpUsers: []
        },
        {
          title: 'Generative AI & LLM Systems Workshop',
          description: 'Hands-on training building RAG applications, fine-tuning open-weights models, and deploying on Gemini API with Dr. Arvind Kumar.',
          category: 'Workshop',
          date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // in 7 days
          time: '2:00 PM - 5:30 PM',
          venue: 'Block C, High-Performance Lab 4',
          organizer: 'Zenith AI Society',
          bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          registrationLink: 'https://portal.horizon.edu/events/genai-ws',
          rsvpUsers: []
        },
        {
          title: 'Annual Tech & Cultural Fest "Aura 2026"',
          description: 'The flagship 3-day annual festival of Horizon Institute featuring battle of the bands, drone racing, robowars, and EDM celebrity night!',
          category: 'Cultural',
          date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // in 14 days
          time: 'All Day (10:00 AM - 10:00 PM)',
          venue: 'Campus Open Air Theatre & Main Grounds',
          organizer: 'Student Council & Cultural Affairs',
          bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
          registrationLink: 'https://aura2026.horizon.edu',
          rsvpUsers: []
        },
        {
          title: 'Tech Career & Internship Fair 2026',
          description: 'Over 40+ leading tech firms, Fortune 500 companies, and fast-growing AI startups recruiting for summer 2026 internships and full-time roles.',
          category: 'Career',
          date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
          time: '9:30 AM - 4:30 PM',
          venue: 'Sports Complex Indoor Arena',
          organizer: 'Training & Placement Office (TPO)',
          bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
          registrationLink: 'https://portal.horizon.edu/tpo/career-fair-2026',
          rsvpUsers: []
        },
        {
          title: 'Inter-College RoboWars & Autonomous Drone Grand Prix',
          description: 'Combat robotics tournament featuring 15kg & 30kg category battle bots alongside obstacle course drone speed races.',
          category: 'Sports',
          date: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
          time: '11:00 AM - 6:00 PM',
          venue: 'Mechanical Courtyard Arena',
          organizer: 'Robotics Guild & Mechanical Engineering',
          bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
          registrationLink: 'https://portal.horizon.edu/events/robowars',
          rsvpUsers: []
        }
      ];

      await Event.insertMany(events);
      console.log(`[Seed] Inserted ${events.length} campus events.`);
    }

    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      console.log('[Seed] Seeding Official Campus Announcements...');
      const announcements = [
        {
          title: 'Mid-Semester Examination Schedule & Room Allocations Released',
          content: 'The Mid-Semester Theory & Practical examinations for all B.Tech / M.Tech batches will commence from the 10th of next month. Download your subject-wise hall tickets and check assigned examination room rosters on the ERP portal.',
          category: 'Exam',
          priority: 'high',
          author: 'Office of Controller of Examinations',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          title: '24/7 Library Access & Extended Quiet Study Zones for Exam Season',
          content: 'To support students during the upcoming exam season, all four floors of the Central Tech Library along with digital compute lounges will remain open 24 hours daily starting this weekend. Free high-speed WiFi and coffee dispensing stations available on Floor 1.',
          category: 'Campus',
          priority: 'medium',
          author: 'Chief Librarian',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          title: 'Google & Microsoft Summer Internship Drive Application Deadline',
          content: 'Eligible 2nd and 3rd year students must submit their verified resumes and Github portfolios on the TPO Placement Portal before this Friday 11:59 PM. Shortlisted candidates will be invited for coding assessments on Saturday.',
          category: 'Placement',
          priority: 'high',
          author: 'Training & Placement Office (TPO)',
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          title: 'Campus High-Speed WiFi Network Upgrade Maintenance',
          content: 'The IT Center will be performing routine optical fiber and core routing firmware upgrades across Academic Blocks A, B, and C on Sunday from 2:00 AM to 5:00 AM. Intermittent network disruptions may occur during this window.',
          category: 'Campus',
          priority: 'low',
          author: 'IT Infrastructure Center',
          publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        }
      ];

      await Announcement.insertMany(announcements);
      console.log(`[Seed] Inserted ${announcements.length} announcements.`);
    }
  } catch (error) {
    console.error('[Seed] Error seeding initial data:', error);
  }
};
