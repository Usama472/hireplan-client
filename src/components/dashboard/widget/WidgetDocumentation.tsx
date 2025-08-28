import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Book, Code, Globe, Palette } from 'lucide-react';
import { toast } from 'sonner';

const WidgetDocumentation: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const codeExamples = {
    basic: `<!-- Add to your HTML -->
<script src="https://hireplan.co/api/v1/widget/script?companyId=YOUR_COMPANY_ID"></script>
<div data-hireplan data-company-id="YOUR_COMPANY_ID" data-theme="light"></div>`,
    
    advanced: `<script>
document.addEventListener('DOMContentLoaded', function() {
    const widget = new HirePlanWidget('jobs-container', {
        companyId: 'YOUR_COMPANY_ID',
        theme: 'dark',
        limit: 5,
        categories: ['engineering', 'design']
    });
    widget.init();
});
</script>`,

    react: `import { useEffect, useRef } from 'react';

const JobsWidget = ({ companyId, theme = 'light' }) => {
    const widgetRef = useRef();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = \`https://hireplan.co/api/v1/widget/script?companyId=\${companyId}\`;
        script.onload = () => {
            new window.HirePlanWidget(widgetRef.current.id, {
                companyId, theme
            }).init();
        };
        document.head.appendChild(script);
    }, [companyId, theme]);

    return <div ref={widgetRef} id="hireplan-widget" />;
};`,

    css: `.hp-widget {
    --hp-primary-color: #your-brand-color;
    --hp-secondary-color: #your-secondary-color;
    --hp-border-radius: 12px;
    --hp-font-family: 'Your Font', sans-serif;
}`
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Book className="h-5 w-5" />
          Widget Documentation
        </h3>
        <p className="text-gray-600 text-sm">Complete guide to integrating and customizing your job widget</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="h-4 w-4" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Basic Integration</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(codeExamples.basic)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                <code>{codeExamples.basic}</code>
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Steps:</h4>
              <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
                <li>Replace <code className="bg-gray-100 px-1 rounded">YOUR_COMPANY_ID</code> with your actual company ID</li>
                <li>Paste the code where you want jobs to appear</li>
                <li>The widget loads automatically!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Advanced Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Manual Initialization</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(codeExamples.advanced)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                <code>{codeExamples.advanced}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Configuration Options:</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">theme:</span>
                  <Badge variant="outline">'light' | 'dark' | 'auto'</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">limit:</span>
                  <Badge variant="outline">number (1-50)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">categories:</span>
                  <Badge variant="outline">string[]</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* React Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="h-4 w-4" />
              React Component
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">React Integration</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(codeExamples.react)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                <code>{codeExamples.react}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Usage:</h4>
              <code className="text-xs bg-gray-100 p-2 rounded block">
                {`<JobsWidget companyId="your-id" theme="dark" />`}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Styling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Custom Styling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">CSS Variables</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(codeExamples.css)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                <code>{codeExamples.css}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available Variables:</h4>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {[
                  '--hp-primary-color',
                  '--hp-secondary-color', 
                  '--hp-background',
                  '--hp-text',
                  '--hp-border-radius',
                  '--hp-font-family'
                ].map(variable => (
                  <code key={variable} className="bg-gray-100 px-2 py-1 rounded">
                    {variable}
                  </code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Widget Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">✅ Responsive Design</h4>
              <p className="text-xs text-gray-600">Works perfectly on all screen sizes</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">✅ Theme Support</h4>
              <p className="text-xs text-gray-600">Light, dark, and auto themes</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">✅ Job Applications</h4>
              <p className="text-xs text-gray-600">Built-in application forms</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">✅ Custom Branding</h4>
              <p className="text-xs text-gray-600">Match your brand colors and fonts</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">✅ Fast Loading</h4>
              <p className="text-xs text-gray-600">Optimized for performance</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-700">✅ CORS Support</h4>
              <p className="text-xs text-gray-600">Works on any domain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Support & Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Need Help?</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Examples
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Book className="h-4 w-4 mr-2" />
                  Full Documentation
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Support</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <p>Email: <a href="mailto:support@hireplan.co" className="text-blue-600 hover:underline">support@hireplan.co</a></p>
                <p>Response time: Usually within 24 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WidgetDocumentation;
