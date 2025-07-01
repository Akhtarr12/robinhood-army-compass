
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, User, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Robin {
  id: string;
  name: string;
  photo: string;
  assignedLocation: string;
  assignedDate: string;
  createdAt: Date;
}

const locations = [
  'Raghubir Nagar',
  'Delhi Cantt',
  'Janakpuri',
  'Dwarka',
  'Rohini',
  'Lajpat Nagar',
  'Connaught Place',
  'Karol Bagh'
];

const RobinsSection = () => {
  const [robins, setRobins] = useState<Robin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRobin, setEditingRobin] = useState<Robin | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    assignedLocation: '',
    assignedDate: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      photo: '',
      assignedLocation: '',
      assignedDate: ''
    });
    setEditingRobin(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRobin) {
      // Update existing robin
      setRobins(robins.map(robin => 
        robin.id === editingRobin.id 
          ? { ...robin, ...formData }
          : robin
      ));
      toast({
        title: "Robin Updated",
        description: `${formData.name}'s information has been updated successfully.`,
      });
    } else {
      // Add new robin
      const newRobin: Robin = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date()
      };
      setRobins([...robins, newRobin]);
      toast({
        title: "Robin Registered",
        description: `${formData.name} has been successfully registered as a volunteer.`,
      });
    }
    
    resetForm();
  };

  const handleEdit = (robin: Robin) => {
    setFormData({
      name: robin.name,
      photo: robin.photo,
      assignedLocation: robin.assignedLocation,
      assignedDate: robin.assignedDate
    });
    setEditingRobin(robin);
    setShowForm(true);
  };

  const handleDelete = (robinId: string) => {
    const robin = robins.find(r => r.id === robinId);
    setRobins(robins.filter(r => r.id !== robinId));
    toast({
      title: "Robin Removed",
      description: `${robin?.name} has been removed from the volunteer list.`,
      variant: "destructive"
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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
                <Label htmlFor="assignedLocation">Assigned Location *</Label>
                <Select value={formData.assignedLocation} onValueChange={(value) => setFormData({ ...formData, assignedLocation: value })}>
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

              <div className="space-y-2">
                <Label htmlFor="assignedDate">Assignment Date *</Label>
                <Input
                  id="assignedDate"
                  type="date"
                  value={formData.assignedDate}
                  onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
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
              const count = robins.filter(robin => robin.assignedLocation === location).length;
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
        {robins.map((robin) => (
          <Card key={robin.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {robin.photo ? (
                    <img
                      src={robin.photo}
                      alt={robin.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{robin.name}</h3>
                    <p className="text-sm text-gray-500">Volunteer</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(robin)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(robin.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-medium">{robin.assignedLocation}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Assignment: {new Date(robin.assignedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined: {robin.createdAt.toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {robins.length === 0 && (
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

export default RobinsSection;
