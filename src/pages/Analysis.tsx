import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Upload,
  Brain,
  Target,
  Loader2,
  FileText,
  CheckCircle,
  X,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import Spline from '@splinetool/react-spline';
import { geminiService } from "../services/gemini";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";

const Analysis = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    experience: "",
  });
  const [formData, setFormData] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { strengths, weaknesses, opportunities, threats } = formData;
    return (
      strengths.trim() &&
      weaknesses.trim() &&
      opportunities.trim() &&
      threats.trim()
    );
  };

  const analyzeProfile = async () => {
    if (!validateForm()) {
      alert("Please fill in all SWOT fields before analyzing.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const prompt = `
        Please analyze the following SWOT analysis and provide comprehensive career recommendations:

        STRENGTHS:
        ${formData.strengths}

        WEAKNESSES:
        ${formData.weaknesses}

        OPPORTUNITIES:
        ${formData.opportunities}

        THREATS:
        ${formData.threats}

        Based on this SWOT analysis, please provide:
        1. Career path recommendations (at least 3 specific career options)
        2. Skills to develop (based on weaknesses and opportunities)
        3. Action plan with specific steps
        4. Timeline for career development
        5. Ways to leverage strengths
        6. Strategies to mitigate threats
        7. Industry trends that align with their profile

        Please format the response in a structured, actionable manner that would be helpful for career planning.
      `;

      const analysis = await geminiService.generateText(prompt);

      // Navigate to results page with the analysis data
      navigate("/AnalysisResults", {
        state: {
          swotData: formData,
          analysis: analysis,
        },
      });
    } catch (error) {
      console.error("Error analyzing profile:", error);
      alert("Failed to analyze profile. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResumeDataChange = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF, DOC, DOCX, or TXT file");
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Create a proper event-like object for the file upload handler
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const result = e.target?.result;

        if (file.type === "text/plain") {
          resolve(result as string);
        } else if (file.type === "application/pdf") {
          // For PDF files, we'll extract basic text
          // Note: This is a simplified approach. For production, you'd want to use a proper PDF parser
          try {
            const text = result as string;
            // Basic text extraction - in production, use pdf-parse or similar library
            resolve(text);
          } catch (error) {
            reject(new Error("Failed to extract text from PDF"));
          }
        } else {
          // For DOC/DOCX files, we'll treat them as text for now
          // In production, you'd want to use mammoth.js or similar library
          resolve(result as string);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));

      if (file.type === "text/plain") {
        reader.readAsText(file);
      } else {
        reader.readAsText(file); // Simplified approach
      }
    });
  };

  const extractSwotFromAnalysis = (analysisText: string) => {
    // Initialize default values
    let strengths =
      "Strong technical skills and experience based on resume analysis";
    let weaknesses = "Areas for improvement identified from resume review";
    let opportunities = "Career growth opportunities based on current profile";
    let threats = "Market challenges and competitive factors to consider";

    try {
      // Extract Strengths
      const strengthsMatch = analysisText.match(
        /(?:strengths?|strong points?)[:\s]*\n?((?:(?!weaknesses?|opportunities?|threats?|##)[^\n])*(?:\n(?!weaknesses?|opportunities?|threats?|##)[^\n]*)*)/i
      );
      if (strengthsMatch) {
        const extracted = strengthsMatch[1]
          .replace(/^\s*[-*•]\s*/gm, "") // Remove bullet points
          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold formatting
          .replace(/\[(.*?)\]/g, "$1") // Remove brackets
          .trim()
          .substring(0, 400); // Limit length
        if (extracted && extracted.length > 10) {
          strengths = extracted;
        }
      }

      // Extract Weaknesses
      const weaknessesMatch = analysisText.match(
        /(?:weaknesses?|areas for improvement|limitations?)[:\s]*\n?((?:(?!strengths?|opportunities?|threats?|##)[^\n])*(?:\n(?!strengths?|opportunities?|threats?|##)[^\n]*)*)/i
      );
      if (weaknessesMatch) {
        const extracted = weaknessesMatch[1]
          .replace(/^\s*[-*•]\s*/gm, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\[(.*?)\]/g, "$1")
          .trim()
          .substring(0, 400);
        if (extracted && extracted.length > 10) {
          weaknesses = extracted;
        }
      }

      // Extract Opportunities
      const opportunitiesMatch = analysisText.match(
        /(?:opportunities?|potential|growth areas?)[:\s]*\n?((?:(?!strengths?|weaknesses?|threats?|##)[^\n])*(?:\n(?!strengths?|weaknesses?|threats?|##)[^\n]*)*)/i
      );
      if (opportunitiesMatch) {
        const extracted = opportunitiesMatch[1]
          .replace(/^\s*[-*•]\s*/gm, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\[(.*?)\]/g, "$1")
          .trim()
          .substring(0, 400);
        if (extracted && extracted.length > 10) {
          opportunities = extracted;
        }
      }

      // Extract Threats
      const threatsMatch = analysisText.match(
        /(?:threats?|challenges?|risks?|obstacles?)[:\s]*\n?((?:(?!strengths?|weaknesses?|opportunities?|##)[^\n])*(?:\n(?!strengths?|weaknesses?|opportunities?|##)[^\n]*)*)/i
      );
      if (threatsMatch) {
        const extracted = threatsMatch[1]
          .replace(/^\s*[-*•]\s*/gm, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\[(.*?)\]/g, "$1")
          .trim()
          .substring(0, 400);
        if (extracted && extracted.length > 10) {
          threats = extracted;
        }
      }
    } catch (error) {
      console.error("Error extracting SWOT from analysis:", error);
    }

    return {
      strengths,
      weaknesses,
      opportunities,
      threats,
    };
  };

  const analyzeResume = async () => {
    if (!uploadedFile || !resumeData.name || !resumeData.email) {
      alert("Please upload a resume and fill in your name and email");
      return;
    }

    setIsUploadingResume(true);

    try {
      // Extract text from the uploaded file
      const resumeText = await extractTextFromFile(uploadedFile);

      // Use the gemini service to analyze the resume
      const analysis = await geminiService.analyzeResume(
        resumeText,
        resumeData
      );

      // Extract SWOT data from the AI analysis
      const extractedSwot = extractSwotFromAnalysis(analysis);

      // Navigate to results page with the analysis data
      navigate("/AnalysisResults", {
        state: {
          swotData: extractedSwot,
          analysis: analysis,
        },
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert(
        "Failed to analyze resume. Please try again or use manual SWOT analysis."
      );
    } finally {
      setIsUploadingResume(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/WQefUMAul1WPo1p6/scene.splinecode" />
      </div>
      {/* Navigation */}

      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-8 w-8 text-primary" />
            <a className="text-2xl font-bold text-primary bg-none cursor-pointer" onClick={() => (window.location.href = '/')}>PathLens AI</a>
          </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <UserMenu />
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/signup')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Career Analysis
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete your SWOT analysis to get personalized career
            recommendations powered by AI
          </p>
        </div>
      </section>

      {/* Analysis Form */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Manual SWOT Input */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span>Manual SWOT Analysis</span>
                </CardTitle>
                <CardDescription>
                  Fill out your strengths, weaknesses, opportunities, and
                  threats manually
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="strengths">Strengths</Label>
                  <Textarea
                    id="strengths"
                    placeholder="List your key strengths, skills, and advantages..."
                    className="min-h-[100px]"
                    value={formData.strengths}
                    onChange={(e) =>
                      handleInputChange("strengths", e.target.value)
                    }
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weaknesses">Weaknesses</Label>
                  <Textarea
                    id="weaknesses"
                    placeholder="Identify areas for improvement and limitations..."
                    className="min-h-[100px]"
                    value={formData.weaknesses}
                    onChange={(e) =>
                      handleInputChange("weaknesses", e.target.value)
                    }
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opportunities">Opportunities</Label>
                  <Textarea
                    id="opportunities"
                    placeholder="External opportunities you can leverage..."
                    className="min-h-[100px]"
                    value={formData.opportunities}
                    onChange={(e) =>
                      handleInputChange("opportunities", e.target.value)
                    }
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threats">Threats</Label>
                  <Textarea
                    id="threats"
                    placeholder="External challenges or obstacles..."
                    className="min-h-[100px]"
                    value={formData.threats}
                    onChange={(e) =>
                      handleInputChange("threats", e.target.value)
                    }
                    disabled={isAnalyzing}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={analyzeProfile}
                  disabled={isAnalyzing || !validateForm()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Profile...
                    </>
                  ) : (
                    "Analyze My Profile"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resume Upload */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-6 w-6 text-primary" />
                  <span>Resume Upload</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume for automatic SWOT analysis using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-12 w-12 text-green-600" />
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-green-600 mb-2">
                          File Uploaded Successfully!
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {uploadedFile.name} (
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedFile();
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Drop your resume here
                      </p>
                      <p className="text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <Button variant="outline">Choose File</Button>
                      <p className="text-sm text-muted-foreground mt-4">
                        Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume-name">Full Name *</Label>
                    <Input
                      id="resume-name"
                      placeholder="Enter your full name"
                      value={resumeData.name}
                      onChange={(e) =>
                        handleResumeDataChange("name", e.target.value)
                      }
                      disabled={isUploadingResume}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume-email">Email Address *</Label>
                    <Input
                      id="resume-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resumeData.email}
                      onChange={(e) =>
                        handleResumeDataChange("email", e.target.value)
                      }
                      disabled={isUploadingResume}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume-experience">
                      Years of Experience
                    </Label>
                    <Input
                      id="resume-experience"
                      type="number"
                      placeholder="e.g., 5"
                      value={resumeData.experience}
                      onChange={(e) =>
                        handleResumeDataChange("experience", e.target.value)
                      }
                      disabled={isUploadingResume}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={analyzeResume}
                  disabled={
                    isUploadingResume ||
                    !uploadedFile ||
                    !resumeData.name ||
                    !resumeData.email
                  }
                >
                  {isUploadingResume ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    "Upload & Analyze Resume"
                  )}
                </Button>
                {(!uploadedFile || !resumeData.name || !resumeData.email) && (
                  <p className="text-xs text-muted-foreground text-center">
                    {!uploadedFile
                      ? "Upload a resume file"
                      : "Fill in required fields"}{" "}
                    to enable analysis
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Options */}
          <div className="mt-12 text-center">
            <Card className="p-6 bg-muted/30">
              <CardContent className="px-0">
                <h3 className="text-xl font-semibold mb-4">
                  Need Help Getting Started?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Not sure how to complete your SWOT analysis? Check out our
                  guide or use our interactive questionnaire.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">SWOT Guide</Button>
                  <Button variant="outline">Interactive Questionnaire</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-muted/100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">PathLens</span>
              </div>
              <p className="text-muted-foreground mb-4">
                AI-powered career guidance to help you discover and achieve your professional goals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PathLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Analysis;
