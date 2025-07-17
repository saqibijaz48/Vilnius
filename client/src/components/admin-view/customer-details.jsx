import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersForAdmin } from "@/store/admin/order-slice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function CustomerDetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const { orderList } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  // Extract unique customers from orders
  const customers = orderList.reduce((acc, order) => {
    const customerId = order.userId;
    if (!acc[customerId]) {
      acc[customerId] = {
        id: customerId,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        orders: [],
        addressInfo: order.addressInfo
      };
    }
    
    acc[customerId].totalOrders += 1;
    acc[customerId].totalSpent += order.totalAmount;
    acc[customerId].orders.push(order);
    
    if (!acc[customerId].lastOrderDate || new Date(order.orderDate) > new Date(acc[customerId].lastOrderDate)) {
      acc[customerId].lastOrderDate = order.orderDate;
    }
    
    return acc;
  }, {});

  const customerList = Object.values(customers);

  const filteredCustomers = customerList.filter(customer =>
    customer.addressInfo?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.addressInfo?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.addressInfo?.phone?.includes(searchTerm) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="secondary">
              Total Customers: {customerList.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.addressInfo?.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{customer.addressInfo?.address}</div>
                      <div className="text-gray-500">
                        {customer.addressInfo?.city}, {customer.addressInfo?.pincode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.totalOrders}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${customer.totalSpent.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {customer.lastOrderDate ? 
                      new Date(customer.lastOrderDate).toLocaleDateString() : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={customer.totalOrders > 5 ? "default" : "secondary"}
                    >
                      {customer.totalOrders > 5 ? "VIP" : "Regular"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{customerList.length}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {customerList.reduce((sum, customer) => sum + customer.totalOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              ${customerList.reduce((sum, customer) => sum + customer.totalSpent, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              ${customerList.length > 0 ? 
                (customerList.reduce((sum, customer) => sum + customer.totalSpent, 0) / customerList.length).toFixed(2) : 
                '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">Avg. Order Value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomerDetails;