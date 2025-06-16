import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || "");
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      await updateProfile(currentUser, {
        displayName: displayName
      });
      toast.success('Profile updated successfully');
      // Add navigation to home page
      navigate('/');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setUploading(true);
      const storage = getStorage();
      const fileRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}-${file.name}`);
      
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });

      setPhotoURL(downloadURL);
      currentUser.reload();
      toast.success('Profile picture updated successfully');
      // Add navigation to home page
      navigate('/');
    } catch (error) {
      toast.error('Failed to update profile picture');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container max-w-4xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <div className="container max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account settings and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={photoURL} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to update your profile picture
              </p>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Your email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </div>
            </form>

            {/* Account Info */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Account created</span>
                  <span>
                    {currentUser?.metadata.creationTime ? 
                      new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Last sign in</span>
                  <span>
                    {currentUser?.metadata.lastSignInTime ? 
                      new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Email verified</span>
                  <span>{currentUser?.emailVerified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;