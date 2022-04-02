import { EPost } from "../enums/post.enum";

export interface Post {
    id: string;
    territory: string;
    type: EPost;
    link?: string;
    title?: string;
    description?: string;
    resource?: string;
    updatedAt: Date;
    createdAt: Date;
}

export interface CreatePost extends Omit<Post, 'id' | 'updatedAt' | 'createdAt'> { }
export interface UpdateTerritory extends CreatePost { }