import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for people (replace with database)
let people: any[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    type: 'Staff',
    department: 'Security',
    phone: '555-0101',
    addedBy: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Doe',
    type: 'Vendor',
    company: 'ABC Cleaning Services',
    phone: '555-0102',
    addedBy: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    type: 'Guest',
    company: 'Tech Corp',
    phone: '555-0103',
    addedBy: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    type: 'Vendor',
    company: 'Medical Supplies Inc',
    phone: '555-0104',
    addedBy: 'admin',
    addedAt: new Date().toISOString()
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    type: 'Staff',
    department: 'Administration',
    phone: '555-0105',
    addedBy: 'admin',
    addedAt: new Date().toISOString()
  }
];

let personIdCounter = 6;

// Get all people with search and filter
router.get('/', (req: Request, res: Response) => {
  const { search, type, limit } = req.query;
  
  let filteredPeople = [...people];
  
  // Filter by type
  if (type && type !== 'all') {
    filteredPeople = filteredPeople.filter(person => 
      person.type.toLowerCase() === (type as string).toLowerCase()
    );
  }
  
  // Search by name or company
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredPeople = filteredPeople.filter(person =>
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm) ||
      person.company?.toLowerCase().includes(searchTerm) ||
      person.department?.toLowerCase().includes(searchTerm)
    );
  }
  
  // Limit results for auto-complete
  if (limit) {
    filteredPeople = filteredPeople.slice(0, parseInt(limit as string));
  }
  
  // Sort by name
  filteredPeople.sort((a, b) => 
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );
  
  res.json({
    success: true,
    people: filteredPeople,
    total: filteredPeople.length
  });
});

// Add new person
router.post('/', (req: Request, res: Response) => {
  const { firstName, lastName, type, company, department, phone, addedBy } = req.body;
  
  if (!firstName || !lastName || !type) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, and type are required'
    });
  }
  
  // Check if person already exists
  const existingPerson = people.find(person =>
    person.firstName.toLowerCase() === firstName.toLowerCase() &&
    person.lastName.toLowerCase() === lastName.toLowerCase() &&
    person.type === type
  );
  
  if (existingPerson) {
    return res.status(409).json({
      success: false,
      message: 'Person with this name and type already exists',
      existingPerson: existingPerson
    });
  }
  
  const newPerson = {
    id: personIdCounter++,
    firstName,
    lastName,
    type,
    company: company || null,
    department: department || null,
    phone: phone || null,
    addedBy: addedBy || 'unknown',
    addedAt: new Date().toISOString()
  };
  
  people.push(newPerson);
  
  res.status(201).json({
    success: true,
    message: `${type} added successfully`,
    person: newPerson
  });
});

// Get person by ID
router.get('/:id', (req: Request, res: Response) => {
  const person = people.find(p => p.id === req.params.id);
  
  if (!person) {
    return res.status(404).json({
      success: false,
      message: 'Person not found'
    });
  }
  
  res.json({
    success: true,
    person: person
  });
});

// Update person
router.put('/:id', (req: Request, res: Response) => {
  const personIndex = people.findIndex(p => p.id === req.params.id);
  
  if (personIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Person not found'
    });
  }
  
  people[personIndex] = {
    ...people[personIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
    updatedBy: req.body.updatedBy || 'unknown'
  };
  
  res.json({
    success: true,
    message: 'Person updated successfully',
    person: people[personIndex]
  });
});

// Delete person
router.delete('/:id', (req: Request, res: Response) => {
  const personIndex = people.findIndex(p => p.id === req.params.id);
  
  if (personIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Person not found'
    });
  }
  
  const deletedPerson = people[personIndex];
  people.splice(personIndex, 1);
  
  res.json({
    success: true,
    message: 'Person deleted successfully',
    deletedPerson: deletedPerson
  });
});

// Get people statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  const stats = {
    total: people.length,
    staff: people.filter(p => p.type === 'Staff').length,
    vendors: people.filter(p => p.type === 'Vendor').length,
    guests: people.filter(p => p.type === 'Guest').length,
    recentlyAdded: people.filter(p => {
      const addedDate = new Date(p.addedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate >= weekAgo;
    }).length
  };
  
  res.json({
    success: true,
    stats: stats
  });
});

// Search people (for auto-complete)
router.get('/search/:query', (req: Request, res: Response) => {
  const query = req.params.query.toLowerCase();
  const limit = parseInt((req.query.limit as string) || '10');
  
  const searchResults = people
    .filter(person =>
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(query) ||
      person.company?.toLowerCase().includes(query) ||
      person.department?.toLowerCase().includes(query)
    )
    .slice(0, limit)
    .map(person => ({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      type: person.type,
      company: person.company,
      department: person.department,
      displayName: `${person.firstName} ${person.lastName}`,
      subtitle: person.type === 'Staff' ? person.department : person.company
    }));
  
  res.json({
    success: true,
    results: searchResults,
    query: req.params.query
  });
});

export default router; 