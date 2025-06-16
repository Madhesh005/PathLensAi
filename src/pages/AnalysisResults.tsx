import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Brain,
  Download,
  Share,
  RefreshCw,
  CheckCircle,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  Star,
  Zap,
  Clock,
  Users,
  Search,
  BookOpen,
} from "lucide-react";
import Spline from '@splinetool/react-spline';
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import html2pdf from 'html2pdf.js';
import { toast } from "react-hot-toast";


interface SwotData {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

interface AnalysisData {
  swotData: SwotData;
  analysis: string;
}

interface LocationState {
  swotData: SwotData;
  analysis: string;
}

const AnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const state = location.state as LocationState | null;

    if (!state?.analysis) {
      navigate("/analysis");
      return;
    }

    setAnalysisData({
      swotData: state.swotData,
      analysis: state.analysis,
    });
  }, [location.state, navigate]);

  const formatAnalysisContent = (content: string) => {
    const sections = content.split("##").filter((section) => section.trim());

    return sections.map((section, index) => {
      const lines = section.trim().split("\n");
      const title = lines[0].trim();
      const sectionContent = lines.slice(1).join("\n").trim();

      let icon = <Lightbulb className="h-5 w-5" />;
      let iconColor = "text-purple-600";
      let borderColor = "border-l-purple-500";
      let bgColor = "bg-purple-50";

      if (title.toLowerCase().includes("career")) {
        icon = <Target className="h-5 w-5" />;
        iconColor = "text-blue-600";
        borderColor = "border-l-blue-500";
        bgColor = "bg-blue-50";
      }
      if (title.toLowerCase().includes("skills")) {
        icon = <TrendingUp className="h-5 w-5" />;
        iconColor = "text-green-600";
        borderColor = "border-l-green-500";
        bgColor = "bg-green-50";
      }
      if (
        title.toLowerCase().includes("action") ||
        title.toLowerCase().includes("plan")
      ) {
        icon = <CheckCircle className="h-5 w-5" />;
        iconColor = "text-orange-600";
        borderColor = "border-l-orange-500";
        bgColor = "bg-orange-50";
      }
      if (
        title.toLowerCase().includes("threat") ||
        title.toLowerCase().includes("mitigation")
      ) {
        icon = <Shield className="h-5 w-5" />;
        iconColor = "text-red-600";
        borderColor = "border-l-red-500";
        bgColor = "bg-red-50";
      }
      if (
        title.toLowerCase().includes("strength") ||
        title.toLowerCase().includes("leveraging")
      ) {
        icon = <Star className="h-5 w-5" />;
        iconColor = "text-yellow-600";
        borderColor = "border-l-yellow-500";
        bgColor = "bg-yellow-50";
      }
      if (
        title.toLowerCase().includes("industry") ||
        title.toLowerCase().includes("insight")
      ) {
        icon = <Zap className="h-5 w-5" />;
        iconColor = "text-indigo-600";
        borderColor = "border-l-indigo-500";
        bgColor = "bg-indigo-50";
      }
      if (
        title.toLowerCase().includes("next") ||
        title.toLowerCase().includes("step")
      ) {
        icon = <Clock className="h-5 w-5" />;
        iconColor = "text-teal-600";
        borderColor = "border-l-teal-500";
        bgColor = "bg-teal-50";
      }

      const formatText = (text: string) => {
        return text
          .split("\n")
          .map((line, lineIndex) => {
            const trimmedLine = line.trim();

            if (!trimmedLine) return null;

            // Handle bracketed descriptions
            if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
              return (
                <div
                  key={lineIndex}
                  className={`${bgColor} p-4 rounded-lg mb-4 italic border-l-4 ${borderColor}`}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {trimmedLine.slice(1, -1)}
                  </p>
                </div>
              );
            }

            // Handle bullet points with * or -
            if (trimmedLine.startsWith("*") || trimmedLine.startsWith("-")) {
              return (
                <div
                  key={lineIndex}
                  className="flex items-start space-x-3 mb-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div
                    className={`w-2 h-2 ${iconColor.replace(
                      "text-",
                      "bg-"
                    )} rounded-full mt-2.5 flex-shrink-0`}
                  ></div>
                  <p className="text-foreground leading-relaxed">
                    {formatInlineText(trimmedLine.substring(1).trim())}
                  </p>
                </div>
              );
            }

            // Handle numbered lists
            if (/^\d+\./.test(trimmedLine)) {
              const number = trimmedLine.match(/^(\d+)\./)?.[1];
              const text = trimmedLine.replace(/^\d+\.\s*/, "");
              return (
                <div
                  key={lineIndex}
                  className="flex items-start space-x-3 mb-4 p-4 rounded-lg bg-muted/20 border border-muted"
                >
                  <div
                    className={`w-7 h-7 ${iconColor.replace(
                      "text-",
                      "bg-"
                    )} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm`}
                  >
                    {number}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed font-medium">
                      {formatInlineText(text)}
                    </p>
                  </div>
                </div>
              );
            }

            // Handle headers (lines that end with :)
            if (trimmedLine.endsWith(":") && trimmedLine.length < 100) {
              return (
                <h4
                  key={lineIndex}
                  className={`font-semibold ${iconColor} text-lg mb-3 flex items-center space-x-2 pt-2`}
                >
                  <Users className="h-4 w-4" />
                  <span>{trimmedLine}</span>
                </h4>
              );
            }

            // Handle bold text and regular paragraphs
            return (
              <p
                key={lineIndex}
                className="mb-3 leading-relaxed text-foreground"
              >
                {formatInlineText(trimmedLine)}
              </p>
            );
          })
          .filter(Boolean);
      };

      const formatInlineText = (text: string) => {
        // Handle **bold** text
        let formattedText = text.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold text-foreground">$1</strong>'
        );

        // Handle *italic* text
        formattedText = formattedText.replace(
          /\*(.*?)\*/g,
          '<em class="italic">$1</em>'
        );

        // Return as JSX
        return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
      };

      return (
        <Card
          key={index}
          className={`mb-8 border-l-4 ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
        >
          <CardHeader className={`${bgColor} border-b`}>
            <CardTitle
              className={`flex items-center space-x-3 ${iconColor} text-xl font-bold`}
            >
              {icon}
              <span>{title}</span>
              <span className="ml-auto text-xs bg-white/80 px-2 py-1 rounded-full text-muted-foreground">
                Section {index + 1}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">{formatText(sectionContent)}</div>
          </CardContent>
        </Card>
      );
    });
  };

  const handleDownload = () => {
    if (!analysisData) return;

    // Create a new window with the report content
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Career Analysis Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              font-size: 28px;
              margin: 0;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              color: #2563eb;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 2px solid #e5e7eb;
            }
            .swot-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .swot-item {
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid;
            }
            .strengths {
              background: #f0fdf4;
              border-left-color: #22c55e;
            }
            .weaknesses {
              background: #fef3f2;
              border-left-color: #ef4444;
            }
            .opportunities {
              background: #eff6ff;
              border-left-color: #3b82f6;
            }
            .threats {
              background: #fefbeb;
              border-left-color: #f59e0b;
            }
            .swot-item h4 {
              margin: 0 0 10px 0;
              font-weight: bold;
            }
            .analysis-section {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #6366f1;
            }
            .analysis-section h3 {
              color: #6366f1;
              margin-top: 0;
            }
            ul, ol {
              padding-left: 20px;
            }
            li {
              margin-bottom: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #666;
              font-size: 14px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Career Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} | PathLens Career Compass AI</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">📊 SWOT Analysis Summary</h2>
            <div class="swot-grid">
              <div class="swot-item strengths">
                <h4>💪 Strengths</h4>
                <p>${analysisData.swotData.strengths}</p>
              </div>
              <div class="swot-item weaknesses">
                <h4>🔧 Weaknesses</h4>
                <p>${analysisData.swotData.weaknesses}</p>
              </div>
              <div class="swot-item opportunities">
                <h4>🚀 Opportunities</h4>
                <p>${analysisData.swotData.opportunities}</p>
              </div>
              <div class="swot-item threats">
                <h4>⚠️ Threats</h4>
                <p>${analysisData.swotData.threats}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">🤖 AI-Powered Career Insights</h2>
            ${formatAnalysisForPDF(analysisData.analysis)}
          </div>
          
          <div class="footer">
            <p>This report was generated by PathLens Career Compass AI</p>
            <p>For more career guidance, visit our platform</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const formatAnalysisForPDF = (content: string) => {
    const sections = content.split("##").filter((section) => section.trim());

    return sections
      .map((section, index) => {
        const lines = section.trim().split("\n");
        const title = lines[0].trim();
        const sectionContent = lines.slice(1).join("\n").trim();

        const formattedContent = sectionContent
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .split("\n")
          .map((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return "";

            if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
              return `<div style="background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 10px 0; font-style: italic; border-left: 3px solid #64748b;"><p>${trimmedLine.slice(
                1,
                -1
              )}</p></div>`;
            }

            if (trimmedLine.startsWith("*") || trimmedLine.startsWith("-")) {
              return `<li>${trimmedLine.substring(1).trim()}</li>`;
            }

            if (trimmedLine.match(/^\d+\./)) {
              return `<li>${trimmedLine.replace(/^\d+\./, "").trim()}</li>`;
            }

            return `<p>${trimmedLine}</p>`;
          })
          .join("");

        return `
        <div class="analysis-section">
          <h3>${title}</h3>
          <div>${formattedContent}</div>
        </div>
      `;
      })
      .join("");
  };

  const handleShare = async () => {
    try {
      // Generate PDF first
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Generate the report HTML content
      const reportContent = document.getElementById('analysis-report')?.innerHTML;
      if (!reportContent) {
        toast.error('Failed to generate report content');
        printWindow.close();
        return;
      }

      // Write the report content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Career Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              .analysis-section { margin-bottom: 32px; }
              h3 { color: #334155; }
            </style>
          </head>
          <body>
            <div id="analysis-report">${reportContent}</div>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Wait for the new window to finish rendering
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Convert to PDF blob
      const pdf = await html2pdf().from(printWindow.document.body).output('blob');
      
      // Share file
      const file = new File([pdf], 'career-analysis.pdf', { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Career Analysis Report',
          text: 'My personalized career analysis from PathLens AI'
        });
      } else {
        // Fallback - download the PDF
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'career-analysis.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share report');
    }
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="from-background to-muted/20">
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
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-green-600 bg-clip-text text-transparent">
            Your Career Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            AI-powered insights and recommendations based on your SWOT analysis
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <Download className="h-5 w-5" />
              <span>Download Report</span>
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <Share className="h-5 w-5" />
              <span>Share Results</span>
            </Button>
            <Link to="/analysis">
              <Button
                size="lg"
                className="flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <RefreshCw className="h-5 w-5" />
                <span>New Analysis</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SWOT Summary */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-12 shadow-xl border-0 bg-gradient-to-r from-white to-muted/10">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">
                Your SWOT Analysis Summary
              </CardTitle>
              <CardDescription className="text-lg">
                The foundation of your personalized career analysis
              </CardDescription>
              <Separator className="mt-4" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border-l-4 border-l-green-500 bg-green-50">
                    <h4 className="font-bold text-green-700 mb-3 flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Strengths</span>
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                      {analysisData.swotData.strengths}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border-l-4 border-l-blue-500 bg-blue-50">
                    <h4 className="font-bold text-blue-700 mb-3 flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Opportunities</span>
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {analysisData.swotData.opportunities}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border-l-4 border-l-orange-500 bg-orange-50">
                    <h4 className="font-bold text-orange-700 mb-3 flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Weaknesses</span>
                    </h4>
                    <p className="text-sm text-orange-800 leading-relaxed">
                      {analysisData.swotData.weaknesses}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border-l-4 border-l-red-500 bg-red-50">
                    <h4 className="font-bold text-red-700 mb-3 flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Threats</span>
                    </h4>
                    <p className="text-sm text-red-800 leading-relaxed">
                      {analysisData.swotData.threats}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Analysis Results */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI-Powered Career Insights
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Based on your SWOT analysis, here are personalized recommendations
              crafted specifically for your career development journey.
            </p>
            <Separator className="mt-6 max-w-md mx-auto" />
          </div>

          <div className="space-y-8">
            {formatAnalysisContent(analysisData.analysis)}
          </div>
        </div>
      </section>

      {/* Next Steps CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-blue-600/5">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-8 shadow-2xl border-0 bg-gradient-to-br from-white to-muted/20">
            <CardContent className="px-0">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4">Ready to Take Action?</h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Your comprehensive career analysis is complete! Now it's time to
                transform these insights into actionable steps toward your
                professional goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/analysis">
                  <Button
                    size="lg"
                    className="px-8 py-3 text-lg hover:scale-105 transition-transform"
                  >
                    Create Another Analysis
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg hover:scale-105 transition-transform"
                >
                  Book Career Consultation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Useful Features Section */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>AI Career Coach</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized advice and resources from our AI-powered coach
                </p>
                <Button variant="outline" className="w-full">
                  Access AI Coach
                </Button>
              </CardContent>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Learning Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access curated learning materials based on your skill gaps
                </p>
                <Button variant="outline" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Job Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore job opportunities that match your profile
                </p>
                <Button variant="outline" className="w-full">
                  View Jobs
                </Button>
              </CardContent>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Skill Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your progress and skill development
                </p>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
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

export default AnalysisResults;
