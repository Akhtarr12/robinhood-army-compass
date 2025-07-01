
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, User, School, Hash, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  photo: string;
  motherName: string;
  fatherName: string;
  aadhaarNumber: string;
  schoolName?: string;
  ageGroup: string;
  createdAt: Date;
}

const ChildrenSection = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    motherName: '',
    fatherName: '',
    aadhaarNumber: '',
    schoolName: '',
    ageGroup: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      photo: '',
      motherName: '',
      fatherName: '',
      aadhaarNumber: '',
      schoolName: '',
      ageGroup: ''
    });
    setEditingChild(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingChild) {
      // Update existing child
      setChildren(children.map(child => 
        child.id === editingChild.id 
          ? { ...child, ...formData }
          : child
      ));
      toast({
        title: "Child Updated",
        description: `${formData.name}'s information has been updated successfully.`,
      });
    } else {
      // Add new child
      const newChild: Child = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date()
      };
      setChildren([...children, newChild]);
      toast({
        title: "Child Registered",
        description: `${formData.name} has been successfully registered.`,
      });
    }
    
    resetForm();
  };

  const handleEdit = (child: Child) => {
    setFormData({
      name: child.name,
      photo: child.photo,
      motherName: child.motherName,
      fatherName: child.fatherName,
      aadhaarNumber: child.aadhaarNumber,
      schoolName: child.schoolName || '',
      ageGroup: child.ageGroup
    });
    setEditingChild(child);
    setShowForm(true);
  };

  const handleDelete = (childId: string) => {
    const child = children.find(c => c.id === childId);
    setChildren(children.filter(c => c.id !== childId));
    toast({
      title: "Child Removed",
      description: `${child?.name} has been removed from the registry.`,
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
                <Label htmlFor="motherName">Mother's Name *</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  required
                  placeholder="Enter mother's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  required
                  placeholder="Enter father's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                <Input
                  id="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  required
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Enter school name if applicable"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ageGroup">Age Group *</Label>
                <Select value={formData.ageGroup} onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
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
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {child.photo ? (
                    <img
                      src={child.photo}
                      alt={child.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500">{child.ageGroup} years old</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(child)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(child.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  Mother: {child.motherName}
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  Father: {child.fatherName}
                </div>
                <div className="flex items-center text-gray-600">
                  <Hash className="h-4 w-4 mr-2" />
                  Aadhaar: ****{child.aadhaarNumber.slice(-4)}
                </div>
                {child.schoolName && (
                  <div className="flex items-center text-gray-600">
                    <School className="h-4 w-4 mr-2" />
                    School: {child.schoolName}
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Registered: {child.createdAt.toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {children.length === 0 && (
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

export default ChildrenSection;
