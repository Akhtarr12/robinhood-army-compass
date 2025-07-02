import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, MapPin, Users, Car, Camera, FileText, Image, Star, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Drive } from '@/hooks/useSupabaseData';

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

const DriveManagementSection = () => {
  const {
    drives,
    robins,
    children,
    robinDrives,
    childAttendance,
    addDrive,
    updateDrive,
    uploadPhoto,
    loading
  } = useSupabaseData();

  const [showForm, setShowForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null);
  const [showSummary, setShowSummary] = useState<string | null>(null);
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

  // Get drive participants
  const getDriveParticipants = (driveId: string) => {
    const participatingRobins = robinDrives
      .filter(drive => drive.drive_id === driveId)
      .map(drive => robins.find(robin => robin.id === drive.robin_id))
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

    if (editingDrive) {
      const { error } = await updateDrive(editingDrive.id, driveData);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update drive. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Drive Updated",
          description: `${formData.name} has been successfully updated.`,
        });
        resetForm();
      }
    } else {
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
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoType: 'robin_group' | 'children_group' | 'combined_group') => {
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
        const fieldName = `${photoType}_photo_url` as keyof typeof formData;
        setFormData({ ...formData, [fieldName]: data });
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

  const editDrive = (drive: Drive) => {
    setFormData({
      name: drive.name,
      date: drive.date,
      location: drive.location,
      summary: drive.summary || '',
      robin_group_photo_url: drive.robin_group_photo_url,
      children_group_photo_url: drive.children_group_photo_url,
      combined_group_photo_url: drive.combined_group_photo_url,
      items_distributed: Array.isArray(drive.items_distributed) ? drive.items_distributed : []
    });
    setEditingDrive(drive);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drive Management</h1>
          <p className="text-gray-600 mt-1">Create and manage Sunday drives with comprehensive tracking</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Drive
        </Button>
      </div>

      {/* Enhanced Stats Cards with Real-time Data */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drives</p>
                <p className="text-2xl font-bold text-gray-900">{drives.length}</p>
              </div>
              <Car className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drives.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Robins Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {robinDrives.filter(rd => rd.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">First-Time Robins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {robinDrives.filter(rd => rd.robin_id && robins.find(r => r.id === rd.robin_id)?.is_first_drive).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Photos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {drives.filter(d => d.combined_group_photo_url || d.robin_group_photo_url || d.children_group_photo_url).length}
                </p>
              </div>
              <Camera className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Drive Assignment Dashboard */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            Today's Drive Assignments - Real Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((location) => {
              const todayRobins = robinDrives.filter(rd => 
                rd.location === location && 
                rd.date === new Date().toISOString().split('T')[0]
              );
              const firstTimeRobins = todayRobins.filter(rd => 
                robins.find(r => r.id === rd.robin_id)?.is_first_drive
              );
              
              return (
                <div key={location} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{location}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Robins:</span>
                      <span className="font-bold text-green-600">{todayRobins.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>First-Time Robins:</span>
                      <span className="font-bold text-yellow-600">{firstTimeRobins.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experienced:</span>
                      <span className="font-bold text-blue-600">{todayRobins.length - firstTimeRobins.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Drive Creation/Edit Form */}
      {showForm && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-purple-600" />
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
                  placeholder="e.g., Sunday Drive - Uttam Nagar"
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
                    <SelectValue placeholder="Select drive location" />
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

              {/* Items Distributed Section */}
              <div className="md:col-span-2 space-y-2">
                <Label>Items Distributed</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add distributed item..."
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                  />
                  <Button type="button" onClick={addItem} variant="outline">
                    Add Item
                  </Button>
                </div>
                {formData.items_distributed.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.items_distributed.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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

      {/* Drives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map((drive) => {
          const { participatingRobins, attendingChildren } = getDriveParticipants(drive.id);
          const hasPhotos = drive.robin_group_photo_url || drive.children_group_photo_url || drive.combined_group_photo_url;
          
          return (
            <Card key={drive.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{drive.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(drive.date)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {drive.location}
                      </div>
                    </div>
                  </div>
                  {hasPhotos && (
                    <div className="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-full">
                      <Camera className="h-4 w-4 text-pink-600" />
                    </div>
                  )}
                </div>

                {/* Participants Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Robins:</span>
                    <span className="font-medium">{participatingRobins.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Children:</span>
                    <span className="font-medium">{attendingChildren.length}</span>
                  </div>
                  {drive.items_distributed && Array.isArray(drive.items_distributed) && drive.items_distributed.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{drive.items_distributed.length}</span>
                    </div>
                  )}
                </div>

                {/* Drive Photos Preview */}
                {hasPhotos && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {drive.robin_group_photo_url && (
                      <img
                        src={drive.robin_group_photo_url}
                        alt="Robins"
                        className="w-full h-16 object-cover rounded-lg"
                      />
                    )}
                    {drive.children_group_photo_url && (
                      <img
                        src={drive.children_group_photo_url}
                        alt="Children"
                        className="w-full h-16 object-cover rounded-lg"
                      />
                    )}
                    {drive.combined_group_photo_url && (
                      <img
                        src={drive.combined_group_photo_url}
                        alt="Combined"
                        className="w-full h-16 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}

                {/* Summary Preview */}
                {drive.summary && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{drive.summary}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowSummary(showSummary === drive.id ? null : drive.id)}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {showSummary === drive.id ? 'Hide' : 'View'} Summary
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => editDrive(drive)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Edit
                  </Button>
                </div>

                {/* Detailed Summary */}
                {showSummary === drive.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Participating Robins ({participatingRobins.length})</h4>
                      <div className="space-y-1">
                        {participatingRobins.map((robin, index) => (
                          <div key={robin?.id || index} className="flex items-center text-sm text-gray-600">
                            <Users className="h-3 w-3 mr-2" />
                            {robin?.name || 'Unknown Robin'}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Attending Children ({attendingChildren.length})</h4>
                      <div className="space-y-1">
                        {attendingChildren.map((child, index) => (
                          <div key={child?.id || index} className="flex items-center text-sm text-gray-600">
                            <Star className="h-3 w-3 mr-2" />
                            {child?.name || 'Unknown Child'} ({child?.age_group || 'Unknown'} years)
                          </div>
                        ))}
                      </div>
                    </div>

                    {drive.items_distributed && Array.isArray(drive.items_distributed) && drive.items_distributed.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Items Distributed</h4>
                        <div className="flex flex-wrap gap-1">
                          {drive.items_distributed.map((item, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {drive.summary && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Drive Summary</h4>
                        <p className="text-sm text-gray-600">{drive.summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {drives.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drives created yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first drive to begin tracking Sunday activities.</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Create First Drive
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DriveManagementSection;