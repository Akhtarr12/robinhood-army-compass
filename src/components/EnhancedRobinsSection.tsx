import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, User, MapPin, Calendar, Trophy, Car, Clock, Search, AlertTriangle, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Robin } from '@/hooks/useSupabaseData';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const EnhancedRobinsSection = () => {
  const {
    robins,
    robinDrives,
    robinUnavailability,
    addRobin,
    addRobinDrive,
    updateRobinLocation,
    addRobinUnavailability,
    uploadPhoto,
    setInitialDriveCount,
    loading
  } = useSupabaseData();

  const [showForm, setShowForm] = useState(false);
  const [editingRobin, setEditingRobin] = useState<Robin | null>(null);
  const [showDriveForm, setShowDriveForm] = useState<string | null>(null);
  const [showLocationEdit, setShowLocationEdit] = useState<string | null>(null);
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    photo_url: null as string | null,
    assigned_location: '',
    home_location: '',
    assigned_date: ''
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

  // Enhanced search functionality
  const filteredRobins = useMemo(() => {
    return robins.filter(robin => {
      const matchesName = robin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAssignedLocation = !searchLocation || robin.assigned_location === searchLocation;
      const matchesHomeLocation = !searchLocation || robin.home_location === searchLocation;
      
      return matchesName && (matchesAssignedLocation || matchesHomeLocation || !searchLocation);
    });
  }, [robins, searchTerm, searchLocation]);

  const resetForm = () => {
    setFormData({
      name: '',
      photo_url: null,
      assigned_location: '',
      home_location: '',
      assigned_date: ''
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
      status: 'active'
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
        description: `${formData.name} has been successfully registered as a volunteer.`,
      });
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
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Robin
        </Button>
      </div>

      {/* Enhanced Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Robins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search by Name</Label>
              <Input
                placeholder="Enter robin name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Location</Label>
              <Select value={searchLocation && searchLocation !== '' ? searchLocation : 'none'} onValueChange={setSearchLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location && location !== '' ? location : 'placeholder'}>
                      {location && location !== '' ? location : 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchTerm || searchLocation) && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredRobins.length} robins
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Robins</p>
                <p className="text-2xl font-bold text-gray-900">{robins.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {robins.reduce((sum, robin) => sum + (robin.drive_count || 0), 0)}
                </p>
              </div>
              <Car className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Robins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {robins.filter(r => r.status === 'active').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">First-Time Robins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {robins.filter(r => isFirstTimeRobin(r)).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drive Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Drive Leaderboard
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
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{robin.name}</p>
                      {isFirstTimeRobin(robin) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          New
                        </span>
                      )}
                    </div>
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
                      <SelectItem key={location} value={location && location !== '' ? location : 'placeholder'}>
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
                      <SelectItem key={location} value={location && location !== '' ? location : 'placeholder'}>
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
                    </div>
                    <p className="text-sm text-gray-500">Volunteer</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {robin.drive_count || 0} drives completed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">Assigned: {robin.assigned_location && robin.assigned_location !== '' ? robin.assigned_location : 'Location not set'}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowLocationEdit(robin.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                
                {robin.home_location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                    <span>Home: {robin.home_location && robin.home_location !== '' ? robin.home_location : 'Location not set'}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Assignment: {formatDate(robin.assigned_date)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined: {formatDate(robin.created_at)}
                </div>
              </div>

              <div className="mb-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    robin.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {robin.status || 'Active'}
                  </span>
                </div>
              </div>

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
                        <SelectItem key={location} value={location && location !== '' ? location : 'placeholder'}>
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
                        const { error } = await addRobinUnavailability(robin.id, unavailabilityData.date, unavailabilityData.reason);
                        if (error) {
                          toast({
                            title: "Error",
                            description: "Failed to record unavailability.",
                            variant: "destructive"
                          });
                        } else {
                          toast({
                            title: "Unavailability Recorded",
                            description: "Unavailability has been recorded.",
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
                  onClick={() => setShowUnavailabilityForm(robin.id)}
                  className="w-full mb-2 bg-orange-600 hover:bg-orange-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark Unavailable
                </Button>
              )}

              {/* Drive Recording Section */}
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
                        <SelectItem key={location} value={location && location !== '' ? location : 'placeholder'}>
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
                        <SelectItem key={option} value={option && option !== '' ? option : 'placeholder'}>
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
                        placeholder="Add item..."
                        value={currentItem}
                        onChange={(e) => setCurrentItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                      />
                      <Button type="button" onClick={addItem} variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                    {driveFormData.items_brought.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {driveFormData.items_brought.map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* First Drive Dialog */}
      {showFirstDriveDialog && (
        <Card className="border-2 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              First Drive Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Welcome! Is this your first drive with Robinhood Army?
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={async () => {
                    // Mark as first drive (no action needed, already default)
                    toast({
                      title: "Welcome!",
                      description: "Marked as your first drive. Good luck!",
                    });
                    setShowFirstDriveDialog(null);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Yes, This is My First Drive
                </Button>
                
                <Button 
                  onClick={() => {
                    // Show input for previous drive count
                    const count = parseInt(prompt("How many drives have you participated in before?") || "0");
                    if (count > 0) {
                      setInitialDriveCount(showFirstDriveDialog, count).then(({ error }) => {
                        if (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update drive count.",
                            variant: "destructive"
                          });
                        } else {
                          toast({
                            title: "Drive Count Updated",
                            description: `Set previous drive count to ${count}`,
                          });
                        }
                      });
                    }
                    setShowFirstDriveDialog(null);
                  }}
                  variant="outline"
                >
                  No, I've Done Drives Before
                </Button>
              </div>
              
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => setShowFirstDriveDialog(null)}
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

export default EnhancedRobinsSection;