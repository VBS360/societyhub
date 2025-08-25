import { TrendingUp, TrendingDown, IndianRupee, CreditCard, Receipt, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';

const mockFinancials = {
  totalBalance: 285000,
  monthlyIncome: 45000,
  monthlyExpenses: 32000,
  pendingDues: 15000,
  recentTransactions: [
    {
      id: '1',
      type: 'income',
      amount: 5000,
      description: 'Maintenance Fee - Unit A-101',
      date: '2024-01-15',
      category: 'Maintenance'
    },
    {
      id: '2',
      type: 'expense',
      amount: 12000,
      description: 'Elevator Maintenance',
      date: '2024-01-14',
      category: 'Maintenance'
    },
    {
      id: '3',
      type: 'income',
      amount: 3000,
      description: 'Parking Fee - Unit B-205',
      date: '2024-01-13',
      category: 'Parking'
    },
    {
      id: '4',
      type: 'expense',
      amount: 8500,
      description: 'Security Services',
      date: '2024-01-12',
      category: 'Security'
    },
    {
      id: '5',
      type: 'income',
      amount: 4500,
      description: 'Maintenance Fee - Unit C-302',
      date: '2024-01-11',
      category: 'Maintenance'
    }
  ],
  monthlyExpenseBreakdown: [
    { category: 'Security', amount: 25000, percentage: 35 },
    { category: 'Maintenance', amount: 18000, percentage: 25 },
    { category: 'Utilities', amount: 15000, percentage: 21 },
    { category: 'Cleaning', amount: 8000, percentage: 11 },
    { category: 'Administration', amount: 6000, percentage: 8 }
  ]
};

const Finances = () => {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
            <p className="text-muted-foreground">
              Society financial overview and expense tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              <IndianRupee className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Total Balance
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-green-700 dark:text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                ₹{mockFinancials.totalBalance.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Monthly Income
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                ₹{mockFinancials.monthlyIncome.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                From maintenance & fees
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Monthly Expenses
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-orange-700 dark:text-orange-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                ₹{mockFinancials.monthlyExpenses.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Operational costs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                Pending Dues
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-red-700 dark:text-red-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                ₹{mockFinancials.pendingDues.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                From 3 units
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFinancials.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className={`h-4 w-4 ${
                            transaction.type === 'income' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFinancials.monthlyExpenseBreakdown.map((expense, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{expense.category}</span>
                      <span className="text-sm font-medium">₹{expense.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                        style={{ width: `${expense.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {expense.percentage}% of total
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Finances;