import { prisma } from '../lib/prisma.js';
import { io } from '../server.js';

export const getStoreState = () => {
    return prisma.storeState.findFirst();
}

export const updateStoreState =  async (id: number, data: {isOpen: boolean}) => {
    const storeState = await prisma.storeState.update({where: {id}, data});
    io.emit('storeState: updated', storeState);
    return storeState;
}