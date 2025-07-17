import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UnauthPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You don't have permission to access this page. This area is restricted to authorized administrators only.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/shop/home")} 
              className="w-full"
            >
              Go to Home
            </Button>
            <Button 
              onClick={() => navigate("/auth/login")} 
              variant="outline" 
              className="w-full"
            >
              Login as Different User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default UnauthPage;
