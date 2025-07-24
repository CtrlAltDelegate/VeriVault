import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for daily entries (replace with database)
let dailyEntries: any[] = [];
let entryIdCounter = 1;

// Get today's entries
router.get('/today', (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayEntries = dailyEntries
    .filter(entry => entry.timestamp.startsWith(today))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  res.json({
    success: true,
    entries: todayEntries,
    total: todayEntries.length,
    date: today
  });
});

// Get all entries with date filtering
router.get('/', (req: Request, res: Response) => {
  const { date, type, limit, offset } = req.query;
  
  let filteredEntries = [...dailyEntries];
  
  // Filter by date
  if (date) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.timestamp.startsWith(date as string)
    );
  }
  
  // Filter by type
  if (type && type !== 'all') {
    filteredEntries = filteredEntries.filter(entry => 
      entry.type === type
    );
  }
  
  // Sort by timestamp (newest first)
  filteredEntries.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Pagination
  const limitNum = parseInt((limit as string) || '50');
  const offsetNum = parseInt((offset as string) || '0');
  const paginatedEntries = filteredEntries.slice(offsetNum, offsetNum + limitNum);
  
  res.json({
    success: true,
    entries: paginatedEntries,
    total: filteredEntries.length,
    limit: limitNum,
    offset: offsetNum
  });
});

// Add new daily entry
router.post('/', (req: Request, res: Response) => {
  const { type, details, enteredBy } = req.body;
  
  if (!type || !details || !enteredBy) {
    return res.status(400).json({
      success: false,
      message: 'Type, details, and enteredBy are required'
    });
  }
  
  const newEntry = {
    id: entryIdCounter++,
    timestamp: new Date().toISOString(),
    type,
    details,
    enteredBy
  };
  
  dailyEntries.push(newEntry);
  
  res.status(201).json({
    success: true,
    message: 'Daily entry added successfully',
    entry: newEntry
  });
});

// Get entry by ID
router.get('/:id', (req: Request, res: Response) => {
  const entry = dailyEntries.find(e => e.id === parseInt(req.params.id));
  
  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Entry not found'
    });
  }
  
  res.json({
    success: true,
    entry: entry
  });
});

// Update entry
router.put('/:id', (req: Request, res: Response) => {
  const entryIndex = dailyEntries.findIndex(e => e.id === parseInt(req.params.id));
  
  if (entryIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Entry not found'
    });
  }
  
  dailyEntries[entryIndex] = {
    ...dailyEntries[entryIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Entry updated successfully',
    entry: dailyEntries[entryIndex]
  });
});

// Delete entry
router.delete('/:id', (req: Request, res: Response) => {
  const entryIndex = dailyEntries.findIndex(e => e.id === parseInt(req.params.id));
  
  if (entryIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Entry not found'
    });
  }
  
  const deletedEntry = dailyEntries[entryIndex];
  dailyEntries.splice(entryIndex, 1);
  
  res.json({
    success: true,
    message: 'Entry deleted successfully',
    deletedEntry: deletedEntry
  });
});

// Get daily statistics
router.get('/stats/daily', (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = dailyEntries.filter(entry => entry.timestamp.startsWith(today));
  
  const stats = {
    total: todayEntries.length,
    guests: todayEntries.filter(e => e.type === 'guest').length,
    vendors: todayEntries.filter(e => e.type === 'vendor').length,
    packages: todayEntries.filter(e => e.type === 'package').length,
    notes: todayEntries.filter(e => e.type === 'note').length,
    byHour: {} as { [hour: number]: number }
  };
  
  // Group by hour
  todayEntries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    if (!stats.byHour[hour]) {
      stats.byHour[hour] = 0;
    }
    stats.byHour[hour]++;
  });
  
  res.json({
    success: true,
    stats: stats,
    date: today
  });
});

export default router; 