import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, School, Hash, Calendar, MapPin, Trophy, Clock, Search, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Child } from '@/hooks/useSupabaseData';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const EnhancedChildrenSection = () => {
  const { 
    children, 
    childAttendance, 
    addChild, 
    addChildAttendance, 
    uploadPhoto,
    loading 
  } = useSupabaseData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAttendance, setShowAttendance] = useState<string | null>(null);
  const [attendanceLocation, setAttendanceLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    photo_url: null as string | null,
    mother_name: '',
    father_name: '',
    aadhaar_number: '',
    school_name: '',
    location: '',
    age_group: 1,
    tags: [] as string[]
  });

  // Enhanced search functionality
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      const matchesName = child.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !searchLocation || child.location === searchLocation;
      const matchesTags = !searchTerm || 
        (child.tags && child.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      return (matchesName || matchesTags) && matchesLocation;
    });
  }, [children, searchTerm, searchLocation]);

  const resetForm = () => {
    setFormData({
      name: '',
      photo_url: null,
      mother_name: '',
      father_name: '',
      aadhaar_number: '',
      school_name: '',
      location: '',
      age_group: 1,
      tags: []
    });
    setEditingChild(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const childData = {
      ...formData,
      attendance_count: 0
    };

    const { error } = await addChild(childData);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to register child. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Child Registered",
        description: `${formData.name} has been successfully registered.`,
      });
      resetForm();
    }
  };

  const handleAttendance = async (childId: string) => {
    if (!attendanceLocation) {
      toast({
        title: "Error",
        description: "Please select a location for attendance.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addChildAttendance(childId, attendanceLocation);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Attendance Marked",
        description: "Child attendance has been recorded successfully.",
      });
      setShowAttendance(null);
      setAttendanceLocation('');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { data, error } = await uploadPhoto(file, 'children');
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

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData({ 
        ...formData, 
        tags: [...formData.tags, currentTag] 
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Get leaderboard data (top 10 children by attendance)
  const leaderboard = children
    .sort((a, b) => (b.attendance_count || 0) - (a.attendance_count || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children Registry</h1>
          <p className="text-gray-600 mt-1">Manage and track children in our care</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Child
        </Button>
      </div>

      {/* Enhanced Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Children
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search by Name or Tag</Label>
              <Input
                placeholder="Enter name or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Location</Label>
              <Select value={searchLocation || "all"} onValueChange={(value) => setSearchLocation(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchTerm || searchLocation) && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredChildren.length} children
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{children.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.reduce((sum, child) => sum + (child.attendance_count || 0), 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(children.filter(c => c.location).map(c => c.location)).size}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Attendance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((child, index) => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  {child.photo_url ? (
                    <img
                      src={child.photo_url}
                      alt={child.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-gray-500">{child.location || 'No location set'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{child.attendance_count || 0}</p>
                  <p className="text-sm text-gray-500">days</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {editingChild ? 'Edit Child Information' : 'Register New Child'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Child's Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter child's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Child's Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_name">Mother's Name *</Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                  required
                  placeholder="Enter mother's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_name">Father's Name *</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  required
                  placeholder="Enter father's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaar_number">Aadhaar Number (Optional)</Label>
                <Input
                  id="aadhaar_number"
                  value={formData.aadhaar_number}
                  onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_name">School Name (Optional)</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  placeholder="Enter school name if applicable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Usual Drive Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select usual location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age_group">Age Group *</Label>
                <Select value={formData.age_group.toString()} onValueChange={(value) => setFormData({ ...formData, age_group: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 18}, (_, i) => i + 3).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Section */}
              <div className="md:col-span-2 space-y-2">
                <Label>Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  {editingChild ? 'Update Child' : 'Register Child'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {child.photo_url ? (
                    <img
                      src={child.photo_url}
                      alt={child.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500">{child.age_group} years old</p>
                    <p className="text-sm text-green-600 font-medium">
                      {child.attendance_count || 0} days attended
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  Mother: {child.mother_name}
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  Father: {child.father_name}
                </div>
                {child.aadhaar_number && (
                  <div className="flex items-center text-gray-600">
                    <Hash className="h-4 w-4 mr-2" />
                    Aadhaar: ****{child.aadhaar_number.slice(-4)}
                  </div>
                )}
                {child.school_name && (
                  <div className="flex items-center text-gray-600">
                    <School className="h-4 w-4 mr-2" />
                    School: {child.school_name}
                  </div>
                )}
                {child.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                    Location: {child.location}
                  </div>
                )}
                {child.tags && child.tags.length > 0 && (
                  <div className="flex items-start text-gray-600">
                    <Tag className="h-4 w-4 mr-2 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {child.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Registered: {formatDate(child.created_at)}
                </div>
              </div>

              {/* Attendance Section */}
              {showAttendance === child.id ? (
                <div className="space-y-3 p-3 bg-green-50 rounded-lg">
                  <Label>Mark Attendance</Label>
                  <Select value={attendanceLocation} onValueChange={setAttendanceLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAttendance(child.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Present
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowAttendance(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => setShowAttendance(child.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChildren.length === 0 && children.length > 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children match your search</h3>
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

      {children.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children registered yet</h3>
            <p className="text-gray-600 mb-4">Start by registering your first child to begin tracking their information.</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Register First Child
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedChildrenSection;