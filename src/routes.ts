import { Router } from 'express';
import bankAccountRoutes from './app/bankAccount/bankAccountRoutes';
import transactionsRoutes from './app/transactions/transactionRoutes';

const routes: Router = Router();

routes.get('/health', (req, res) => {
    res.status(200).json({ grupoPrimo: 'Application /v1 UP' });
});

bankAccountRoutes(routes);
transactionsRoutes(routes);

export default routes;