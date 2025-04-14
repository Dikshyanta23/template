// client/src/pages/tutor/PaymentOverview.jsx
import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function PaymentOverview({ payments, stats }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Group payments by method
  const paymentsByMethod = payments.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
    return acc;
  }, {});
  
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <MonetizationOnIcon />;
      case 'bank transfer':
        return <AccountBalanceIcon />;
      case 'credit card':
        return <CreditCardIcon />;
      default:
        return <PaymentIcon />;
    }
  };
  
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'success';
      case 'bank transfer':
        return 'primary';
      case 'credit card':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              
              <Typography variant="h4" sx={{ mb: 2 }}>
                ${stats?.totalEarnings.toFixed(2) || '0.00'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Total earnings
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <MonetizationOnIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payments
                  </Typography>
                  <Typography variant="h6">
                    ${stats?.pendingPayments.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              
              {Object.entries(paymentsByMethod).length > 0 ? (
                Object.entries(paymentsByMethod).map(([method, amount]) => (
                  <Box key={method} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2, color: `${getPaymentMethodColor(method)}.main` }}>
                      {getPaymentMethodIcon(method)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${amount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No payment methods data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Course</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.paymentMethod}
                            size="small"
                            color={getPaymentMethodColor(payment.paymentMethod)}
                            icon={getPaymentMethodIcon(payment.paymentMethod)}
                          />
                        </TableCell>
                        <TableCell>{payment.student.name}</TableCell>
                        <TableCell>{payment.session.course.title}</TableCell>
                      </TableRow>
                    ))}
                  
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No payment records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={payments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}