import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Calendar, 
  MapPin, 
  Users, 
  Car, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Camera,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Drive, Robin, RobinDrive, ChildAttendance } from '@/hooks/useSupabaseData';

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

const EnhancedDriveManagement = () => {
  const {
    drives,
    robins,
    children,
    robinDrives,
    childAttendance,
    robinUnavailability,
    addDrive,
    updateDrive,
    getTodaysAssignedRobins,
    uploadPhoto,
    loading
  } = useSupabaseData();

  const [showForm, setShowForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null);
  const [showSummary, setShowSummary] = useState<string | null>(null);
  const [todaysAssignedRobins, setTodaysAssignedRobins] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    summary: '',
    robin_group_photo_url: null as string | null,
    children_group_photo_url: null as string | null,
    combined_group_photo_url: null as string | null,
    items_distributed: [] as string[]
  });

  const [currentItem, setCurrentItem] = useState('');

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

  // Get drive participants with enhanced profile information
  const getDriveParticipants = (driveId: string) => {
    const participatingRobins = robinDrives
      .filter(drive => drive.drive_id === driveId)
      .map(drive => {
        const robin = robins.find(r => r.id === drive.robin_id);
        return robin ? {
          ...robin,
          driveDetails: drive
        } : null;
      })
      .filter(Boolean);

    const attendingChildren = childAttendance
      .filter(attendance => attendance.drive_id === driveId)
      .map(attendance => children.find(child => child.id === attendance.child_id))
      .filter(Boolean);

    return { participatingRobins, attendingChildren };
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      location: '',
      summary: '',
      robin_group_photo_url: null,
      children_group_photo_url: null,
      combined_group_photo_url: null,
      items_distributed: []
    });
    setEditingDrive(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const driveData = {
      ...formData,
      items_distributed: formData.items_distributed
    };

    const { error } = await addDrive(driveData);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create drive. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Drive Created",
        description: `${formData.name} has been successfully created.`,
      });
      resetForm();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const { data, error } = await uploadPhoto(file, 'drives');
      if (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo. Please try again.",
          variant: "destructive"
        });
      } else {
        setFormData({ ...formData, [`${type}_photo_url`]: data });
        toast({
          title: "Photo Uploaded",
          description: "Photo has been uploaded successfully.",
        });
      }
    }
  };

  const addItem = () => {
    if (currentItem && !formData.items_distributed.includes(currentItem)) {
      setFormData({
        ...formData,
        items_distributed: [...formData.items_distributed, currentItem]
      });
      setCurrentItem('');
    }
  };

  const removeItem = (itemToRemove: string) => {
    setFormData({
      ...formData,
      items_distributed: formData.items_distributed.filter(item => item !== itemToRemove)
    });
  };

  // Get today's drives
  const todaysDrives = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return drives.filter(drive => drive.date === today);
  }, [drives]);

  // Get upcoming drives
  const upcomingDrives = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return drives.filter(drive => drive.date > today).slice(0, 5);
  }, [drives]);

  // Get past drives
  const pastDrives = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return drives.filter(drive => drive.date < today).slice(0, 10);
  }, [drives]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drive Management</h1>
          <p className="text-gray-600 mt-1">Organize and track Sunday drives</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Drive
        </Button>
      </div>

      {/* Today's Status */}
      {todaysAssignedRobins.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Today's Drive Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysAssignedRobins.map((assignment) => (
                <div key={assignment.robin_id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{assignment.robin_name}</p>
                      <p className="text-sm text-gray-600">{assignment.assigned_location}</p>
                    </div>
                    <Badge variant={assignment.is_unavailable ? "destructive" : "default"}>
                      {assignment.is_unavailable ? "Unavailable" : "Available"}
                    </Badge>
                  </div>
                  {assignment.is_unavailable && (
                    <div className="text-sm text-red-600">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Marked as unavailable
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Availability Summary</p>
                  <p className="text-sm text-gray-600">
                    {todaysAssignedRobins.filter(r => !r.is_unavailable).length} available, 
                    {todaysAssignedRobins.filter(r => r.is_unavailable).length} unavailable
                  </p>
                </div>
                <Badge variant="outline">
                  {todaysAssignedRobins.length} Total Assigned
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drives</p>
                <p className="text-2xl font-bold text-gray-900">{drives.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Drives</p>
                <p className="text-2xl font-bold text-gray-900">{todaysDrives.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {robinDrives.length + childAttendance.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(drives.map(d => d.location)).size}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Drives */}
      {todaysDrives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Today's Drives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysDrives.map((drive) => {
                const { participatingRobins, attendingChildren } = getDriveParticipants(drive.id);
                return (
                  <div key={drive.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{drive.name}</h3>
                        <p className="text-gray-600">{drive.location}</p>
                      </div>
                      <Badge variant="default">Today</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Participating Robins</p>
                        <div className="space-y-1">
                          {participatingRobins.map((robin) => (
                            <div key={robin.id} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-3 w-3 text-blue-600" />
                              </div>
                              <span>{robin.name}</span>
                              {robin.driveDetails?.commute_method && (
                                <Badge variant="outline" className="text-xs">
                                  {robin.driveDetails.commute_method}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Attending Children</p>
                        <div className="space-y-1">
                          {attendingChildren.map((child) => (
                            <div key={child.id} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="h-3 w-3 text-green-600" />
                              </div>
                              <span>{child.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {drive.summary && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-600 mb-1">Summary</p>
                        <p className="text-sm text-gray-700">{drive.summary}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowSummary(drive.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingDrive(drive);
                          setFormData({
                            name: drive.name,
                            date: drive.date,
                            location: drive.location,
                            summary: drive.summary || '',
                            robin_group_photo_url: drive.robin_group_photo_url,
                            children_group_photo_url: drive.children_group_photo_url,
                            combined_group_photo_url: drive.combined_group_photo_url,
                            items_distributed: drive.items_distributed || []
                          });
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Drives */}
      {upcomingDrives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Drives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDrives.map((drive) => (
                <div key={drive.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{drive.name}</h3>
                    <p className="text-sm text-gray-600">{drive.location} • {new Date(drive.date).toLocaleDateString()}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSummary(drive.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drive Creation Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {editingDrive ? 'Edit Drive' : 'Create New Drive'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Drive Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter drive name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Drive Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
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
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="summary">Drive Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Describe what happened during this drive..."
                  rows={3}
                />
              </div>

              {/* Photo Upload Sections */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Robin Group Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'robin_group')}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {formData.robin_group_photo_url && (
                    <img
                      src={formData.robin_group_photo_url}
                      alt="Robin group"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Children Group Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'children_group')}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.children_group_photo_url && (
                    <img
                      src={formData.children_group_photo_url}
                      alt="Children group"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Combined Group Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'combined_group')}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {formData.combined_group_photo_url && (
                    <img
                      src={formData.combined_group_photo_url}
                      alt="Combined group"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Items Distributed */}
              <div className="md:col-span-2 space-y-2">
                <Label>Items Distributed</Label>
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
                  {formData.items_distributed.map((item) => (
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

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  {editingDrive ? 'Update Drive' : 'Create Drive'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Drive Details Dialog */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Drive Details</h2>
              <Button variant="outline" onClick={() => setShowSummary(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            {(() => {
              const drive = drives.find(d => d.id === showSummary);
              if (!drive) return null;
              
              const { participatingRobins, attendingChildren } = getDriveParticipants(drive.id);
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">{drive.name}</h3>
                      <p className="text-gray-600">{drive.location}</p>
                      <p className="text-gray-600">{new Date(drive.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{participatingRobins.length} Robins</Badge>
                      <Badge variant="outline" className="ml-2">{attendingChildren.length} Children</Badge>
                    </div>
                  </div>
                  
                  {drive.summary && (
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-gray-700">{drive.summary}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Participating Robins</h4>
                      <div className="space-y-2">
                        {participatingRobins.map((robin) => (
                          <div key={robin.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              {robin.photo_url ? (
                                <img
                                  src={robin.photo_url}
                                  alt={robin.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{robin.name}</p>
                                <p className="text-sm text-gray-600">{robin.assigned_location}</p>
                              </div>
                            </div>
                            {robin.driveDetails?.commute_method && (
                              <p className="text-sm text-gray-600">
                                Commute: {robin.driveDetails.commute_method}
                              </p>
                            )}
                            {robin.driveDetails?.contribution_message && (
                              <p className="text-sm text-gray-600">
                                Contribution: {robin.driveDetails.contribution_message}
                              </p>
                            )}
                            {robin.email && (
                              <p className="text-sm text-gray-600">Email: {robin.email}</p>
                            )}
                            {robin.phone && (
                              <p className="text-sm text-gray-600">Phone: {robin.phone}</p>
                            )}
                            {robin.skills && robin.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {robin.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Attending Children</h4>
                      <div className="space-y-2">
                        {attendingChildren.map((child) => (
                          <div key={child.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {child.photo_url ? (
                                <img
                                  src={child.photo_url}
                                  alt={child.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{child.name}</p>
                                <p className="text-sm text-gray-600">Age Group: {child.age_group}</p>
                                <p className="text-sm text-gray-600">Mother: {child.mother_name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {drive.items_distributed && drive.items_distributed.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Items Distributed</h4>
                      <div className="flex flex-wrap gap-2">
                        {drive.items_distributed.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {drive.robin_group_photo_url && (
                      <div>
                        <h4 className="font-medium mb-2">Robin Group Photo</h4>
                        <img
                          src={drive.robin_group_photo_url}
                          alt="Robin group"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {drive.children_group_photo_url && (
                      <div>
                        <h4 className="font-medium mb-2">Children Group Photo</h4>
                        <img
                          src={drive.children_group_photo_url}
                          alt="Children group"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {drive.combined_group_photo_url && (
                      <div>
                        <h4 className="font-medium mb-2">Combined Group Photo</h4>
                        <img
                          src={drive.combined_group_photo_url}
                          alt="Combined group"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Past Drives */}
      {pastDrives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Recent Past Drives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastDrives.map((drive) => {
                const { participatingRobins, attendingChildren } = getDriveParticipants(drive.id);
                return (
                  <div key={drive.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{drive.name}</h3>
                      <p className="text-sm text-gray-600">
                        {drive.location} • {new Date(drive.date).toLocaleDateString()} • 
                        {participatingRobins.length} robins, {attendingChildren.length} children
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowSummary(drive.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {drives.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drives created yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first drive to begin organizing Sunday activities.</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create First Drive
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDriveManagement; 