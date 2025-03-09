import {
    type Add,
    type AddParameters,
    AddSchema,
    type Authorize,
    AuthorizeSchema,
    type Modify,
    type ModifyParameters,
    ModifySchema,
    type RequestToken,
    RequestTokenSchema,
    type Retrieve,
    type RetrieveParameters,
    RetrieveSchema,
} from './schema'

export class PocketClient {
    /**
     * Helper function to make a POST request to the Pocket API with the required headers
     * @param endpoint - The API endpoint to request
     * @param body - The request body to send
     */
    private fetch = async (endpoint: string, body: Record<string, unknown>): Promise<Response> =>
        await fetch(`https://getpocket.com/v3${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Accept': 'application/json',
            },
            body: JSON.stringify({
                consumer_key: this.consumer_key,
                access_token: this.access_token,
                ...body,
            }),
        })
            .then(res => {
                console.log(this.consumer_key)
                console.log('res', res)
                return res
            })
            .then(res => res.json())

    // auth
    private readonly redirect_uri: string
    private readonly consumer_key: string
    private readonly access_token: string | undefined

    // constructor
    constructor({redirect_uri, consumer_key, access_token}: {redirect_uri: string; consumer_key: string; access_token?: string | undefined}) {
        this.redirect_uri = redirect_uri
        this.consumer_key = consumer_key
        this.access_token = access_token || undefined
    }

    /** Obtain a request token */
    getRequestToken = async (): Promise<RequestToken> => {
        const response = await this.fetch('/oauth/request', {redirect_uri: this.redirect_uri})
        return RequestTokenSchema.parse(response)
    }

    /** Redirect user to Pocket to continue authorization */
    getAuthorizeUrl = (code: string): string => {
        const url = new URL('https://getpocket.com/auth/authorize')
        url.searchParams.append('request_token', code)
        url.searchParams.append('redirect_uri', `${this.redirect_uri}?code=${code}`)
        return url.toString()
    }

    /** Convert a request token into a Pocket access token */
    authorize = async (code: string): Promise<Authorize> => {
        const response = await this.fetch('/oauth/authorize', {code})
        return AuthorizeSchema.parse(response)
    }

    /** Add an item to the user's Pocket list */
    add = async ({url, title, tags}: AddParameters): Promise<Add> => {
        if (!this.access_token) throw new Error('Missing access token')
        const response = await this.fetch('/add', {url, title, tags})
        return AddSchema.parse(response)
    }

    /** Modify items in the user's Pocket list */
    modify = async (actions: ModifyParameters): Promise<Modify> => {
        if (!this.access_token) throw new Error('Missing access token')
        const response = await this.fetch('/send', {actions})
        return ModifySchema.parse(response)
    }

    /** Retrieve items from the user's Pocket list */
    retrieve = async (options: RetrieveParameters = {}): Promise<Retrieve> => {
        if (!this.access_token) throw new Error('Missing access token')
        const response = await this.fetch('/get', {...options})
        return RetrieveSchema.parse(response)
    }
}
