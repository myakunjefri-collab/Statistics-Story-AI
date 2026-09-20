import { getDatabaseAdapter, type PenggunaEntity } from '../index'

export const UserRepository = {
  async findByEmail(email: string): Promise<PenggunaEntity | null> {
    const adapter = getDatabaseAdapter()
    return adapter.findUserByEmail(email)
  },

  async findById(id: number): Promise<PenggunaEntity | null> {
    const adapter = getDatabaseAdapter()
    return adapter.findUserById(id)
  },

  async create(user: Omit<PenggunaEntity, 'id_pengguna' | 'created_at'>): Promise<PenggunaEntity> {
    const adapter = getDatabaseAdapter()
    return adapter.createUser(user)
  },
}
