import { Router } from 'express';
import bankAccountServices from "./bankAccountServices";

export default (router: Router) => {
    const SERVICE: string = '/account';

    router.get(`${SERVICE}`, bankAccountServices.list);

    router.post(`${SERVICE}`, bankAccountServices.create);

    router.put(`${SERVICE}/:id`, bankAccountServices.edit);

    router.delete(`${SERVICE}/:id`, bankAccountServices.delete);

    router.get(`${SERVICE}/:id`, bankAccountServices.getById);

    router.get(`${SERVICE}/accountId/:accountId`, bankAccountServices.getByAccountId);
};