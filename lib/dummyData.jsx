// lib/dummyData.js
// This file contains all dummy data for the NGO Admin Panel
// When you get real API endpoints, you can replace these exports with API calls

export const stats = [
  {
    id: 1,
    label: 'Total Posts',
    value: '120',
    change: '+12%',
    changeType: 'increase',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconType: 'posts'
  },
  {
    id: 2,
    label: 'Total Images',
    value: '350',
    change: '+8%',
    changeType: 'increase',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
    iconType: 'images'
  },
  {
    id: 3,
    label: 'Draft Posts',
    value: '15',
    change: '-3%',
    changeType: 'decrease',
    color: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    iconType: 'drafts'
  }
];

export const recentPosts = [
  {
    id: 1,
    title: 'Community Event',
    description: 'Annual community gathering and fundraiser event',
    status: 'Published',
    author: 'John Doe',
    createdAt: '2 days ago',
    updatedAt: '2 days ago',
    views: 245,
    likes: 32,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Education Program',
    description: 'New education initiative for underprivileged children',
    status: 'Draft',
    author: 'Jane Smith',
    createdAt: '1 day ago',
    updatedAt: '5 hours ago',
    views: 0,
    likes: 0,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Health Camp',
    description: 'Free medical checkup camp in rural areas',
    status: 'Published',
    author: 'Mike Johnson',
    createdAt: '5 days ago',
    updatedAt: '5 days ago',
    views: 512,
    likes: 67,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    title: 'Food Distribution Drive',
    description: 'Monthly food distribution program for homeless',
    status: 'Published',
    author: 'Sarah Williams',
    createdAt: '1 week ago',
    updatedAt: '1 week ago',
    views: 823,
    likes: 94,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    title: 'Environmental Awareness',
    description: 'Tree plantation and environmental awareness campaign',
    status: 'Scheduled',
    author: 'John Doe',
    createdAt: '3 days ago',
    updatedAt: '1 day ago',
    views: 0,
    likes: 0,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop'
  }
];

export const allPosts = [
  ...recentPosts,
  {
    id: 6,
    title: 'Winter Clothing Drive',
    description: 'Collecting warm clothes for winter season',
    status: 'Published',
    author: 'Jane Smith',
    createdAt: '2 weeks ago',
    updatedAt: '2 weeks ago',
    views: 1234,
    likes: 156,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop'
  },
  {
    id: 7,
    title: 'Skills Training Workshop',
    description: 'Vocational training for youth employment',
    status: 'Draft',
    author: 'Mike Johnson',
    createdAt: '4 days ago',
    updatedAt: '2 days ago',
    views: 0,
    likes: 0,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop'
  }
];

export const mediaLibrary = [
  {
    id: 1,
    filename: 'community-event-1.jpg',
    url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '2.4 MB',
    uploadedBy: 'John Doe',
    uploadedAt: '2 days ago',
    usedIn: ['Community Event'],
    alt: 'Community gathering'
  },
  {
    id: 2,
    filename: 'volunteer-work.jpg',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '3.1 MB',
    uploadedBy: 'Jane Smith',
    uploadedAt: '3 days ago',
    usedIn: ['Food Distribution Drive'],
    alt: 'Volunteers working'
  },
  {
    id: 3,
    filename: 'team-meeting.jpg',
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '1.8 MB',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '5 days ago',
    usedIn: [],
    alt: 'Team discussion'
  },
  {
    id: 4,
    filename: 'kids-learning.jpg',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '2.9 MB',
    uploadedBy: 'Sarah Williams',
    uploadedAt: '1 week ago',
    usedIn: ['Education Program'],
    alt: 'Children in classroom'
  },
  {
    id: 5,
    filename: 'nature-conservation.jpg',
    url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '4.2 MB',
    uploadedBy: 'John Doe',
    uploadedAt: '1 week ago',
    usedIn: ['Environmental Awareness'],
    alt: 'Tree planting'
  },
  {
    id: 6,
    filename: 'healthy-food.jpg',
    url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '2.1 MB',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2 weeks ago',
    usedIn: [],
    alt: 'Fresh vegetables'
  },
  {
    id: 7,
    filename: 'medical-camp.jpg',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '3.5 MB',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '5 days ago',
    usedIn: ['Health Camp'],
    alt: 'Medical checkup'
  },
  {
    id: 8,
    filename: 'workshop.jpg',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '2.7 MB',
    uploadedBy: 'Sarah Williams',
    uploadedAt: '4 days ago',
    usedIn: ['Skills Training Workshop'],
    alt: 'Training session'
  },
  {
    id: 9,
    filename: 'donation-drive.jpg',
    url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=400&fit=crop&auto=format',
    type: 'image',
    size: '3.8 MB',
    uploadedBy: 'John Doe',
    uploadedAt: '3 weeks ago',
    usedIn: [],
    alt: 'Donation collection'
  }
];

export const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@ngo.org',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    joinedAt: '6 months ago',
    postsCount: 45,
    status: 'active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@ngo.org',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    joinedAt: '4 months ago',
    postsCount: 32,
    status: 'active'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@ngo.org',
    role: 'Contributor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    joinedAt: '3 months ago',
    postsCount: 18,
    status: 'active'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@ngo.org',
    role: 'Contributor',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    joinedAt: '2 months ago',
    postsCount: 25,
    status: 'active'
  }
];

export const activityLog = [
  {
    id: 1,
    user: 'John Doe',
    action: 'Published',
    target: 'Community Event',
    timestamp: '2 hours ago',
    type: 'post'
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'Uploaded',
    target: 'volunteer-work.jpg',
    timestamp: '5 hours ago',
    type: 'media'
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'Updated',
    target: 'Health Camp',
    timestamp: '1 day ago',
    type: 'post'
  },
  {
    id: 4,
    user: 'Sarah Williams',
    action: 'Created draft',
    target: 'Skills Training Workshop',
    timestamp: '2 days ago',
    type: 'post'
  },
  {
    id: 5,
    user: 'John Doe',
    action: 'Deleted',
    target: 'old-banner.jpg',
    timestamp: '3 days ago',
    type: 'media'
  }
];

export const categories = [
  { id: 1, name: 'Events', slug: 'events', count: 45, color: '#009cd6' },
  { id: 2, name: 'Education', slug: 'education', count: 28, color: '#10b981' },
  { id: 3, name: 'Health', slug: 'health', count: 32, color: '#f59e0b' },
  { id: 4, name: 'Environment', slug: 'environment', count: 19, color: '#22c55e' },
  { id: 5, name: 'Community', slug: 'community', count: 54, color: '#8b5cf6' }
];

export const settings = {
  general: {
    siteName: 'NGO Admin Panel',
    siteDescription: 'Making a difference in the community',
    contactEmail: 'info@ngo.org',
    contactPhone: '+1 234 567 8900',
    address: '123 Charity Street, City, Country',
    timezone: 'UTC+0',
    language: 'English'
  },
  appearance: {
    primaryColor: '#009cd6',
    secondaryColor: '#2c3e50',
    logoUrl: '',
    faviconUrl: ''
  },
  notifications: {
    emailNotifications: true,
    newPostAlert: true,
    commentAlert: false,
    weeklyReport: true
  },
  social: {
    facebook: 'https://facebook.com/ngo',
    twitter: 'https://twitter.com/ngo',
    instagram: 'https://instagram.com/ngo',
    linkedin: 'https://linkedin.com/company/ngo'
  }
};

// Helper functions to simulate API calls
export const getStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(stats), 500);
  });
};

export const getRecentPosts = (limit = 3) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(recentPosts.slice(0, limit)), 500);
  });
};

export const getAllPosts = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(allPosts), 500);
  });
};

export const getPostById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const post = allPosts.find(post => post.id === parseInt(id));
      resolve(post);
    }, 500);
  });
};

export const getMediaLibrary = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mediaLibrary), 500);
  });
};

export const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 500);
  });
};

export const getActivityLog = (limit = 5) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(activityLog.slice(0, limit)), 500);
  });
};

export const getCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(categories), 500);
  });
};

export const getSettings = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(settings), 500);
  });
};