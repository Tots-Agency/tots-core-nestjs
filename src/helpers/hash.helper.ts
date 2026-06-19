import bcrypt from "bcryptjs";

export class HashHelper {
    static encrypt(password: string): string {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    static compare(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }
}