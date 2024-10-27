import { Router } from 'express';
import transactionServices from "./transactionServices";

export default (router: Router) => {
    const SERVICE: string = '/transaction';

    router.post(`${SERVICE}/deposito`, transactionServices.deposito);
    router.post(`${SERVICE}/saque`, transactionServices.saque);
    router.post(`${SERVICE}/transferencia`, transactionServices.transferencia);
};