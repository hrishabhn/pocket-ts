import {z} from 'zod'

// auth
export const RequestTokenSchema = z.object({
    code: z.string(),
})
export type RequestToken = z.infer<typeof RequestTokenSchema>

export const AuthorizeSchema = z.object({
    access_token: z.string(),
    username: z.string(),
})
export type Authorize = z.infer<typeof AuthorizeSchema>

// shared
const AuthorSchema = z.object({
    author_id: z.string(),
    name: z.string(),
    url: z.string(),
})

const ImageSchema = z.object({
    image_id: z.string(),
    src: z.string(),
    width: z.string(),
    height: z.string(),
    credit: z.string().optional(),
    caption: z.string().optional(),
})

const VideoSchema = z.object({
    video_id: z.string(),
    src: z.string(),
    width: z.string(),
    height: z.string(),
    type: z.string(),
    length: z.string(),
    vid: z.string(),
})

const TagSchema = z.object({
    tag: z.string(),
    item_id: z.string(),
})

const UnixTimestampSchema = z.preprocess(value => Number(value), z.number().int())

// add
export type AddParameters = {
    /** The URL of the item you want to add */
    url: string
    /** This can be included for cases where an item does not have a title, which is typical for image or PDF URLs. If Pocket detects a title from the content of the page, this parameter will be ignored. */
    title?: string
    /** A comma-separated list of tags to apply to the item */
    tags?: string
}

export const AddSchema = z.object({
    status: z.literal(1),
    item: z.object({
        /** A unique identifier for the added item */
        item_id: z.string(),
        /** The original url for the added item */
        normal_url: z.string(),
        /** A unique identifier for the resolved item */
        resolved_id: z.string(),
        /** The resolved url for the added item. The easiest way to think about the resolved_url - if you add a bit.ly link, the resolved_url will be the url of the page the bit.ly link points to */
        resolved_url: z.string(),
        /** A unique identifier for the domain of the `resolved_url` */
        domain_id: z.string(),
        /** A unique identifier for the domain of the `normal_url` */
        origin_domain_id: z.string(),
        /** The response code received by the Pocket parser when it tried to access the item */
        response_code: z.string(),
        /** The MIME type returned by the item */
        mime_type: z.string(),
        /** The content length of the item */
        content_length: z.string(),
        /** The encoding of the item */
        encoding: z.string(),
        /** The date the item was resolved */
        date_resolved: z.string(),
        /** The date the item was published (if the parser was able to find one) */
        date_published: z.string(),
        /** The title of the `resolved url` */
        title: z.string(),
        /** The excerpt of the `resolved url` */
        excerpt: z.string(),
        /** For an article, the number of words */
        word_count: z.string(),
        /** 0: no image; 1: has an image in the body of the article; 2: is an image */
        has_image: z.enum(['0', '1', '2']),
        /** 0: no video; 1: has a video in the body of the article; 2: is a video */
        has_video: z.enum(['0', '1', '2']),
        /** 0 or 1; If the parser thinks this item is an index page it will be set to 1 */
        is_index: z.enum(['0', '1']),
        /** 0 or 1; If the parser thinks this item is an article it will be set to 1 */
        is_article: z.enum(['0', '1']),
        /** Array of author data (if author(s) were found) */
        authors: z.union([z.tuple([]), z.record(AuthorSchema)]),
        /** Array of image data (if image(s) were found) */
        images: z.union([z.tuple([]), z.record(ImageSchema)]),
        /** Array of video data (if video(s) were found) */
        videos: z.union([z.tuple([]), z.record(VideoSchema)]),
    }),
})
export type Add = z.infer<typeof AddSchema>

// modify
/**
 * - `archive` - Move an item to the user's archive
 * - `readd` - Re-add (unarchive) an item to the user's list
 * - `favorite` - Mark an item as a favorite
 * - `unfavorite` - Remove an item from the user's favorites
 * - `delete` - Permanently remove an item from the user's account
 *
 * - `tags_add` - Add one or more tags to an item
 * - `tags_remove` - Remove one or more tags from an item
 * - `tags_replace` - Replace all of the tags for an item with one or more provided tags
 * - `tags_clear` - Remove all tags from an item
 * - `tag_rename` - Rename a tag; this affects all items with this tag
 * - `tag_delete` - Delete a tag; this affects all items with this tag
 */
export type ModifyParameters = (
    | {action: 'archive' | 'readd' | 'favorite' | 'unfavorite' | 'delete'; item_id: string}
    | {action: 'tags_add' | 'tags_remove' | 'tags_replace' | 'tags_clear' | 'tag_rename' | 'tag_delete'; item_id: string; tags: string}
)[]

export const ModifySchema = z.object({
    status: z.literal(1),
    action_results: z.array(z.literal(true)),
})
export type Modify = z.infer<typeof ModifySchema>

// retrieve
export type RetrieveParameters = {
    /**
     * - `unread` - only return unread items
     * - `archive` - only return archived items
     * - `all` - return both unread and archived items (default)
     */
    state?: 'unread' | 'archive' | 'all'
    /**
     * - `0` - only return un-favorited items
     * - `1` - only return favorited items
     */
    favorite?: 0 | 1
    /**
     * - *tag_name* - only return items tagged with *tag_name*
     * - `_untagged_` - only return untagged items
     */
    tag?: string
    /**
     * - `article` - only return articles
     * - `video` - only return videos or articles with embedded videos
     * - `image` - only return images
     */
    contentType?: 'article' | 'video' | 'image'
    /**
     * - `newest` - return items in order of newest to oldest
     * - `oldest` - return items in order of oldest to newest
     * - `title` - return items in order of title alphabetically
     * - `site` - return items in order of url alphabetically
     */
    sort?: 'newest' | 'oldest' | 'title' | 'site'
    /**
     * - `simple` - return basic information about each item, including title, url, status, and more
     * - `complete` - return all data about each item, including tags, images, authors, videos, and more
     */
    detailType?: 'simple' | 'complete'
    /** Only return items whose title or url contain the `search` string */
    search?: string
    /** Only return items from a particular `domain` */
    domain?: string
    /** Only return items modified since the given `since` unix timestamp */
    since?: number
    /** Only return `count` number of items. Note: There is a 30 item per request limit, any requests that go beyond this will be truncated to 30. */
    count?: number
    /** Used only with count; start returning from offset position of results */
    offset?: number
    /** Use with offset and count to determine if there are more pages of results to retrieve. */
    total?: 0 | 1
}

export const RetrieveSchema = z.object({
    status: z.literal(1),
    list: z.record(
        z.discriminatedUnion('status', [
            z.object({
                /** A unique identifier matching the saved item. This id must be used to perform any actions through the `v3/modify` endpoint. */
                item_id: z.string(),
                /** A unique identifier similar to the `item_id` but is unique to the actual url of the saved item. The `resolved_id` identifies unique urls. For example a direct link to a New York Times article and a link that redirects (ex a shortened bit.ly url) to the same article will share the same `resolved_id`. If this value is 0, it means that Pocket has not processed the item. Normally this happens within seconds but is possible you may request the item before it has been resolved. */
                resolved_id: z.string(),
                /** The actual url that was saved with the item. This url should be used if the user wants to view the item. */
                given_url: z.string(),
                /** The final url of the item. For example if the item was a shortened bit.ly link, this will be the actual article the url linked to. */
                resolved_url: z.string(),
                /** The title that was saved along with the item. */
                given_title: z.string(),
                /** The title that Pocket found for the item when it was parsed */
                resolved_title: z.string(),
                /** 0 or 1 - 1 If the item is favorited */
                favorite: z.enum(['0', '1']),
                /** 0, 1, 2 - 1 if the item is archived - 2 if the item should be deleted */
                status: z.enum(['0', '1']),
                /** The first few lines of the item (articles only) */
                excerpt: z.string(),
                /** 0 or 1 - 1 if the item is an article */
                is_article: z.enum(['0', '1']),
                /** 0, 1, or 2 - 1 if the item has images in it - 2 if the item is an image */
                has_image: z.enum(['0', '1', '2']),
                /** 0, 1, or 2 - 1 if the item has videos in it - 2 if the item is a video */
                has_video: z.enum(['0', '1', '2']),
                /** How many words are in the article */
                word_count: z.string(),
                /** A JSON object of the user tags associated with the item */
                tags: z.record(TagSchema),
                /** A JSON object listing all of the authors associated with the item */
                authors: z.record(AuthorSchema).optional(),
                /** A JSON object listing all of the images associated with the item */
                images: z.record(ImageSchema).optional(),
                /** A JSON object listing all of the videos associated with the item */
                videos: z.record(VideoSchema).optional(),

                // missing from docs
                /** Top image url */
                top_image_url: z.string().optional(),
                /** The date the item was added */
                time_added: UnixTimestampSchema,
                /** The date the item was updated */
                time_updated: UnixTimestampSchema,
            }),
            z.object({
                /** A unique identifier matching the saved item. This id must be used to perform any actions through the `v3/modify` endpoint. */
                item_id: z.string(),
                /** 0, 1, 2 - 1 if the item is archived - 2 if the item should be deleted */
                status: z.literal('2'),
            }),
        ])
    ),
})
export type Retrieve = z.infer<typeof RetrieveSchema>
