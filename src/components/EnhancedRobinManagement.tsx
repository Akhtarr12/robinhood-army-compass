import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Car, 
  Clock, 
  Search, 
  AlertTriangle, 
  Star, 
  Users, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Robin } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

const locations = [
  'Raghubir Nagar',
  'Delhi Cantt',
  'Janakpuri',
  'Dwarka',
  'Rohini',
  'Lajpat Nagar',
  'Connaught Place',
  'Karol Bagh',
  'Uttam Nagar'
];

const commuteOptions = [
  'Metro',
  '4-Wheeler (Car)',
  '2-Wheeler (Bike/Scooter)',
  'Bus',
  'Walking',
  'Cycle',
  'Auto-Rickshaw'
];

const skillOptions = [
  'Teaching',
  'First Aid',
  'Cooking',
  'Transportation',
  'Organization',
  'Communication',
  'Technical Skills',
  'Medical Knowledge',
  'Child Care',
  'Event Planning'
];

const EnhancedRobinManagement = () => {
  const { user } = useAuth();
  const {
    robins,
    robinDrives,
    robinUnavailability,
    addRobin,
    addRobinDrive,
    updateRobinLocation,
    addRobinUnavailability,
    completeRobinRegistration,
    getTodaysAssignedRobins,
    canEditRobinProfile,
    uploadPhoto,
    setInitialDriveCount,
    loading
  } = useSupabaseData();

  const [showForm, setShowForm] = useState(false);
  const [editingRobin, setEditingRobin] = useState<Robin | null>(null);
  const [showDriveForm, setShowDriveForm] = useState<string | null>(null);
  const [showLocationEdit, setShowLocationEdit] = useState<string | null>(null);
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [todaysAssignedRobins, setTodaysAssignedRobins] = useState<any[]>([]);
  const [profilePermissions, setProfilePermissions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    photo_url: null as string | null,
    assigned_location: '',
    home_location: '',
    assigned_date: '',
    email: '',
    phone: '',
    emergency_contact: '',
    skills: [] as string[],
    availability_preferences: ''
  });

  const [driveFormData, setDriveFormData] = useState({
    location: '',
    commute_method: '',
    contribution_message: '',
    items_brought: [] as string[]
  });

  const [unavailabilityData, setUnavailabilityData] = useState({
    date: '',
    reason: ''
  });

  const [showFirstDriveDialog, setShowFirstDriveDialog] = useState<string | null>(null);
  const [previousDriveCount, setPreviousDriveCount] = useState(0);
  const [newLocation, setNewLocation] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  // Enhanced search functionality
  const filteredRobins = useMemo(() => {
    return robins.filter(robin => {
      const matchesName = robin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAssignedLocation = !searchLocation || robin.assigned_location === searchLocation;
      const matchesHomeLocation = !searchLocation || robin.home_location === searchLocation;
      
      return matchesName && (matchesAssignedLocation || matchesHomeLocation || !searchLocation);
    });
  }, [robins, searchTerm, searchLocation]);

  // Check if current user is registered as a Robin
  const currentUserRobin = useMemo(() => {
    return robins.find(robin => robin.profile_created_by === user?.id);
  }, [robins, user]);

  // Check if user can add new Robins
  const canAddNewRobins = useMemo(() => {
    return !currentUserRobin || !currentUserRobin.registration_completed;
  }, [currentUserRobin]);

  // Load today's assigned robins
  useEffect(() => {
    const loadTodaysRobins = async () => {
      const { data } = await getTodaysAssignedRobins();
      if (data) {
        setTodaysAssignedRobins(data);
      }
    };
    loadTodaysRobins();
  }, [getTodaysAssignedRobins]);

  // Load profile permissions
  useEffect(() => {
    const loadPermissions = async () => {
      const permissions: Record<string, boolean> = {};
      for (const robin of robins) {
        permissions[robin.id] = await canEditRobinProfile(robin.id);
      }
      setProfilePermissions(permissions);
    };
    loadPermissions();
  }, [robins, canEditRobinProfile]);

  const resetForm = () => {
    setFormData({
      name: '',
      photo_url: null,
      assigned_location: '',
      home_location: '',
      assigned_date: '',
      email: '',
      phone: '',
      emergency_contact: '',
      skills: [],
      availability_preferences: ''
    });
    setEditingRobin(null);
    setShowForm(false);
  };

  const resetDriveForm = () => {
    setDriveFormData({
      location: '',
      commute_method: '',
      contribution_message: '',
      items_brought: []
    });
    setShowDriveForm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const robinData = {
      ...formData,
      drive_count: 0,
      status: 'active',
      registration_completed: false
    };

    const { error } = await addRobin(robinData);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to register robin. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Robin Registered",
        description: `${formData.name} has been successfully registered. Please complete their profile.`,
      });
      resetForm();
    }
  };

  const handleCompleteRegistration = async (robinId: string) => {
    const profileData = {
      email: formData.email,
      phone: formData.phone,
      emergency_contact: formData.emergency_contact,
      skills: formData.skills,
      availability_preferences: formData.availability_preferences
    };

    const { error } = await completeRobinRegistration(robinId, profileData);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete registration. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Registration Completed",
        description: "Robin profile has been completed successfully.",
      });
      setShowProfileDialog(null);
      resetForm();
    }
  };

  const handleDriveRecord = async (robinId: string) => {
    if (!driveFormData.location) {
      toast({
        title: "Error",
        description: "Please select a location for the drive.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addRobinDrive(robinId, driveFormData.location, {
      commute_method: driveFormData.commute_method,
      contribution_message: driveFormData.contribution_message,
      items_brought: driveFormData.items_brought
    });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to record drive. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Drive Recorded",
        description: "Robin drive has been recorded successfully.",
      });
      resetDriveForm();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { data, error } = await uploadPhoto(file, 'robins');
      if (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo. Please try again.",
          variant: "destructive"
        });
      } else {
        setFormData({ ...formData, photo_url: data });
        toast({
          title: "Photo Uploaded",
          description: "Photo has been uploaded successfully.",
        });
      }
    }
  };

  const addItem = () => {
    if (currentItem && !driveFormData.items_brought.includes(currentItem)) {
      setDriveFormData({
        ...driveFormData,
        items_brought: [...driveFormData.items_brought, currentItem]
      });
      setCurrentItem('');
    }
  };

  const removeItem = (itemToRemove: string) => {
    setDriveFormData({
      ...driveFormData,
      items_brought: driveFormData.items_brought.filter(item => item !== itemToRemove)
    });
  };

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Check if robin is first-time (drive_count === 0 or 1)
  const isFirstTimeRobin = (robin: Robin) => {
    return (robin.drive_count || 0) <= 1;
  };

  // Get leaderboard data (top 10 robins by drive count)
  const leaderboard = robins
    .sort((a, b) => (b.drive_count || 0) - (a.drive_count || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Robin Management</h1>
          <p className="text-gray-600 mt-1">Manage volunteers and their location assignments</p>
        </div>
        {canAddNewRobins && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Robin
          </Button>
        )}
      </div>

      {/* Registration Status Alert */}
      {currentUserRobin && !currentUserRobin.registration_completed && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            Your Robin profile is incomplete. Please complete your registration to access all features.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => setShowProfileDialog(currentUserRobin.id)}
            >
              Complete Registration
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Assignments */}
      {todaysAssignedRobins.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Today's Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysAssignedRobins.map((assignment) => (
                <div key={assignment.robin_id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{assignment.robin_name}</p>
                      <p className="text-sm text-gray-600">{assignment.assigned_location}</p>
                    </div>
                    <Badge variant={assignment.is_unavailable ? "destructive" : "default"}>
                      {assignment.is_unavailable ? "Unavailable" : "Available"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search robins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Filter by Location</Label>
              <Select value={searchLocation && searchLocation !== '' ? searchLocation : 'none'} onValueChange={setSearchLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location && location !== '' ? location : 'none'}>
                      {location && location !== '' ? location : 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Top Volunteers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((robin, index) => (
              <div key={robin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  {robin.photo_url ? (
                    <img
                      src={robin.photo_url}
                      alt={robin.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{robin.name}</p>
                    <p className="text-sm text-gray-500">{robin.home_location && robin.home_location !== '' ? robin.home_location : 'Location not set'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{robin.drive_count || 0}</p>
                  <p className="text-sm text-gray-500">drives</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      {showForm && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              {editingRobin ? 'Edit Robin Information' : 'Register New Robin'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Robin's Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter volunteer's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Robin's Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_location">Assigned Location *</Label>
                <Select value={formData.assigned_location && formData.assigned_location !== '' ? formData.assigned_location : 'none'} onValueChange={(value) => setFormData({ ...formData, assigned_location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assigned location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select assigned location</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location && location !== '' ? location : 'none'}>
                        {location && location !== '' ? location : 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="home_location">Home Location</Label>
                <Select value={formData.home_location && formData.home_location !== '' ? formData.home_location : 'none'} onValueChange={(value) => setFormData({ ...formData, home_location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select home location</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location && location !== '' ? location : 'none'}>
                        {location && location !== '' ? location : 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_date">Assignment Date *</Label>
                <Input
                  id="assigned_date"
                  type="date"
                  value={formData.assigned_date}
                  onChange={(e) => setFormData({ ...formData, assigned_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Emergency contact details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability_preferences">Availability Preferences</Label>
                <Textarea
                  id="availability_preferences"
                  value={formData.availability_preferences}
                  onChange={(e) => setFormData({ ...formData, availability_preferences: e.target.value })}
                  placeholder="When are you typically available?"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2 flex-wrap">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-600"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={currentSkill && currentSkill !== '' ? currentSkill : 'none'} onValueChange={setCurrentSkill}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((skill) => (
                        <SelectItem key={skill} value={skill && skill !== '' ? skill : 'none'}>
                          {skill && skill !== '' ? skill : 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addSkill} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  {editingRobin ? 'Update Robin' : 'Register Robin'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Location Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Location Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map((location) => {
              const count = robins.filter(robin => robin.assigned_location === location).length;
              return (
                <div key={location} className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="font-semibold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">{location}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Robins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRobins.map((robin) => (
          <Card key={robin.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {robin.photo_url ? (
                    <img
                      src={robin.photo_url}
                      alt={robin.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{robin.name}</h3>
                      {isFirstTimeRobin(robin) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          New
                        </span>
                      )}
                      {!robin.registration_completed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Incomplete
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Volunteer</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {robin.drive_count || 0} drives completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Assigned: {robin.assigned_location}</span>
                </div>
                {robin.home_location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Home: {robin.home_location}</span>
                  </div>
                )}
                {robin.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{robin.email}</span>
                  </div>
                )}
                {robin.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{robin.phone}</span>
                  </div>
                )}
                {robin.skills && robin.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {robin.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {robin.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{robin.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!robin.registration_completed && profilePermissions[robin.id] && (
                  <Button 
                    size="sm" 
                    onClick={() => setShowProfileDialog(robin.id)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Registration
                  </Button>
                )}

                {profilePermissions[robin.id] ? (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setEditingRobin(robin);
                      setFormData({
                        name: robin.name,
                        photo_url: robin.photo_url,
                        assigned_location: robin.assigned_location,
                        home_location: robin.home_location || '',
                        assigned_date: robin.assigned_date,
                        email: robin.email || '',
                        phone: robin.phone || '',
                        emergency_contact: robin.emergency_contact || '',
                        skills: robin.skills || [],
                        availability_preferences: robin.availability_preferences || ''
                      });
                      setShowForm(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowProfileDialog(robin.id)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                )}

                {/* Location Update Form */}
                {showLocationEdit === robin.id && (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg mb-4">
                    <Label>Update Assigned Location</Label>
                    <Select value={newLocation && newLocation !== '' ? newLocation : 'none'} onValueChange={setNewLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select new location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location && location !== '' ? location : 'none'}>
                            {location && location !== '' ? location : 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={async () => {
                          const { error } = await updateRobinLocation(robin.id, newLocation);
                          if (error) {
                            toast({
                              title: "Error",
                              description: "Failed to update location.",
                              variant: "destructive"
                            });
                          } else {
                            toast({
                              title: "Location Updated",
                              description: `${robin.name}'s location updated to ${newLocation}`,
                            });
                            setShowLocationEdit(null);
                            setNewLocation('');
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Update
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowLocationEdit(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Unavailability Form */}
                {showUnavailabilityForm === robin.id ? (
                  <div className="space-y-3 p-3 bg-orange-50 rounded-lg mb-4">
                    <Label>Mark Unavailable</Label>
                    <Input
                      type="date"
                      value={unavailabilityData.date}
                      onChange={(e) => setUnavailabilityData({
                        ...unavailabilityData,
                        date: e.target.value
                      })}
                    />
                    <Input
                      placeholder="Reason (optional)"
                      value={unavailabilityData.reason}
                      onChange={(e) => setUnavailabilityData({
                        ...unavailabilityData,
                        reason: e.target.value
                      })}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={async () => {
                          const { error } = await addRobinUnavailability(
                            robin.id, 
                            unavailabilityData.date, 
                            unavailabilityData.reason
                          );
                          if (error) {
                            toast({
                              title: "Error",
                              description: "Failed to mark unavailable.",
                              variant: "destructive"
                            });
                          } else {
                            toast({
                              title: "Unavailable Marked",
                              description: `${robin.name} marked as unavailable for ${unavailabilityData.date}`,
                            });
                            setShowUnavailabilityForm(null);
                            setUnavailabilityData({ date: '', reason: '' });
                          }
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Mark Unavailable
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowUnavailabilityForm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowUnavailabilityForm(robin.id)}
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Mark Unavailable
                  </Button>
                )}

                {showDriveForm === robin.id ? (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <Label>Record Drive</Label>
                    <Select value={driveFormData.location && driveFormData.location !== '' ? driveFormData.location : 'none'} onValueChange={(value) => setDriveFormData({...driveFormData, location: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select drive location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select drive location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location && location !== '' ? location : 'none'}>
                            {location && location !== '' ? location : 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={driveFormData.commute_method && driveFormData.commute_method !== '' ? driveFormData.commute_method : 'none'} onValueChange={(value) => setDriveFormData({...driveFormData, commute_method: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did you arrive?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">How did you arrive?</SelectItem>
                        {commuteOptions.map((option) => (
                          <SelectItem key={option} value={option && option !== '' ? option : 'none'}>
                            {option && option !== '' ? option : 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="What are you contributing? (e.g., helping with distribution)"
                      value={driveFormData.contribution_message}
                      onChange={(e) => setDriveFormData({...driveFormData, contribution_message: e.target.value})}
                    />
                    
                    <div className="space-y-2">
                      <Label>Items Brought</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add item"
                          value={currentItem}
                          onChange={(e) => setCurrentItem(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                        />
                        <Button type="button" onClick={addItem} size="sm">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {driveFormData.items_brought.map((item) => (
                          <Badge key={item} variant="secondary" className="gap-1">
                            {item}
                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                              className="ml-1 hover:text-red-600"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDriveRecord(robin.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Record Drive
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={resetDriveForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        // Check if this is potentially a first drive
                        if ((robin.drive_count || 0) === 0) {
                          setShowFirstDriveDialog(robin.id);
                        } else {
                          setShowDriveForm(robin.id);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Record Drive
                    </Button>
                    
                    {(robin.drive_count || 0) === 0 && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => setShowFirstDriveDialog(robin.id)}
                        className="w-full"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Setup Drive History
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Dialog */}
      <Dialog open={!!showProfileDialog} onOpenChange={() => setShowProfileDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Robin Registration</DialogTitle>
            <DialogDescription>
              Please provide additional information to complete the Robin's profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-email">Email</Label>
                <Input
                  id="dialog-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-phone">Phone</Label>
                <Input
                  id="dialog-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-emergency">Emergency Contact</Label>
              <Input
                id="dialog-emergency"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="Emergency contact details"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-availability">Availability Preferences</Label>
              <Textarea
                id="dialog-availability"
                value={formData.availability_preferences}
                onChange={(e) => setFormData({ ...formData, availability_preferences: e.target.value })}
                placeholder="When are you typically available?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2 flex-wrap">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={currentSkill && currentSkill !== '' ? currentSkill : 'none'} onValueChange={setCurrentSkill}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.map((skill) => (
                      <SelectItem key={skill} value={skill && skill !== '' ? skill : 'none'}>
                        {skill && skill !== '' ? skill : 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSkill} size="sm">
                  Add
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => showProfileDialog && handleCompleteRegistration(showProfileDialog)}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Registration
              </Button>
              <Button variant="outline" onClick={() => setShowProfileDialog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Drive Dialog */}
      <Dialog open={!!showFirstDriveDialog} onOpenChange={() => setShowFirstDriveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Drive History</DialogTitle>
            <DialogDescription>
              This appears to be {robins.find(r => r.id === showFirstDriveDialog)?.name}'s first drive. 
              Would you like to set their initial drive count?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drive-count">Previous Drive Count</Label>
              <Input
                id="drive-count"
                type="number"
                min="0"
                value={previousDriveCount}
                onChange={(e) => setPreviousDriveCount(parseInt(e.target.value) || 0)}
                placeholder="Enter previous drive count"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  if (showFirstDriveDialog) {
                    const { error } = await setInitialDriveCount(showFirstDriveDialog, previousDriveCount);
                    if (error) {
                      toast({
                        title: "Error",
                        description: "Failed to set drive count.",
                        variant: "destructive"
                      });
                    } else {
                      toast({
                        title: "Drive Count Set",
                        description: "Initial drive count has been set successfully.",
                      });
                      setShowFirstDriveDialog(null);
                      setPreviousDriveCount(0);
                    }
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Set Drive Count
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFirstDriveDialog(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredRobins.length === 0 && robins.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No robins match your search</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSearchLocation('');
              }} 
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {robins.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers registered yet</h3>
            <p className="text-gray-600 mb-4">Start by registering your first Robin to begin organizing Sunday drives.</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Register First Robin
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedRobinManagement; 