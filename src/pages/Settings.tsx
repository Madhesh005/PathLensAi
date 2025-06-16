import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Eye,
  BookOpen,
  BrainCircuit,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [privacyLevel, setPrivacyLevel] = useState("balanced");
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [learningPreference, setLearningPreference] = useState("visual");

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Implement settings save logic here
      toast.success("Settings saved successfully");
      navigate(-1); // Add this line to go back
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/WQefUMAul1WPo1p6/scene.splinecode" />
      </div>

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

      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Notifications Settings */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive career updates and recommendations via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant updates on your device
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize how PathLens looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            <div className="space-y-1">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </CardTitle>
            <CardDescription>
              Control your privacy and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Profile Privacy</Label>
              <Select value={privacyLevel} onValueChange={setPrivacyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI & Learning Preferences */}
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BrainCircuit className="h-5 w-5" />
              <span>AI & Learning Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize your learning experience and AI interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>AI Career Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Receive personalized career recommendations
                </p>
              </div>
              <Switch
                checked={aiSuggestions}
                onCheckedChange={setAiSuggestions}
              />
            </div>
            <div className="space-y-1">
              <Label>Learning Style Preference</Label>
              <Select value={learningPreference} onValueChange={setLearningPreference}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="reading">Reading/Writing</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;