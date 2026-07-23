---
layout: default
title: ServiceMaster Restore — Location Data API Docs
sections:
  - { id: endpoints,      title: Endpoints }
  - { id: authentication, title: Authentication }
  - { id: api-key,        title: Getting your API key }
  - { id: read,           title: Reading a location, tag: GET }
  - { id: update,         title: Updating a location, tag: PATCH }
  - { id: fields,         title: Writable fields }
  - { id: response-codes, title: Response codes }
  - { id: notes,          title: Important notes }
---

This API enables an authorized external user or system to read and update a small, fixed set of fields on a ServiceMaster Restore Brand **Location** entity.

## 1. Endpoints {#endpoints}

| Name | Purpose | Method(s) | Path | Authentication |
| --- | --- | --- | --- | --- |
| Key | Retrieve personal API key | `GET` | `/api/v1/user/{uid}` | HTTP Basic Auth |
| Location | Read / update a location's data | `GET`, `PATCH` | `/api/v1/location/{location_id}` | API Key |

- All endpoint paths are relative to the environment's base URL.
  - **Local:** `http://docker.localhost:8000/`
  - **Staging:** `https://smr-brand-staging.restore-beta.com/`
  - **Production:** `https://servicemasterrestore.com/`
- Every request must include the `?_format=json` query string.
- Example full request URL: `https://servicemasterrestore.com/api/v1/location/123456?_format=json`

---

## 2. Authentication {#authentication}

### Key Endpoint

The Key endpoint is authenticated via HTTP Basic Auth with your Drupal username and password (base64 encoded). This is a one-time step used to obtain your API key. All Location endpoint calls use this API key.

### Location Endpoint

The Location endpoint is authenticated with an API key. You must send the key in the `api-key` request header on every `GET` or `PATCH` request to the location endpoint.

- The key must be sent in a **header only** — it is not accepted in a query string.
- Send it over **HTTPS only**. The key is a bearer credential: anyone who has it can act as your account.
- The key does not expire on its own. If it is ever exposed, contact RDG (or regenerate it yourself — see Section 2, Option A) and the old key stops working immediately.

---

## 3. Getting your API key {#api-key}

RDG will provide you with your username, password, and user id (uid). Use either path below to obtain your key.

### Option A — Web login (manual)

1. Log in to the site at `/user/login` with the credentials RDG provided.
2. Go to your account's **Key authentication** tab: `/user/{uid}/key-auth` (replace `{uid}` with your user ID).
3. Click **Generate new key**. The page then displays your key and the exact header to use.
4. Copy the key and store it securely in a password or other secrets manager. Never commit this key in code.

You can return to this page any time to generate a new key (which immediately invalidates the previous one) or delete your current key.

### Option B — Key endpoint (programmatic)

Call the Key endpoint with HTTP Basic Auth. Requires the user and password to be colon separated and base64 encoded as a string in the format of `"username:password"`.

#### Encode Credentials (bash)

```bash
echo -n "username:password" | base64
```

#### Code Examples

<details>
<summary>cURL</summary>
{% highlight bash %}
curl --location '{base_url}/api/v1/user/{uid}?format=json' \
--header 'Authorization: Basic <encoded_credentials>'
{% endhighlight %}
</details>

<details>
<summary>JS</summary>
{% highlight javascript %}
const headers = new Headers();
headers.append("Authorization", "Basic <encoded_credentials>");

const requestOptions = {
  method: "GET",
  headers: headers
};

fetch("{base_url}/api/v1/user/{uid}?format=json", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
{% endhighlight %}
</details>

<details>
<summary>PHP</summary>
{% highlight php %}
// Using GuzzleHttp.
$client = new Client();
$headers = [
  'Authorization' => "Basic <encoded_credentials>",
];
$request = new Request(
  'GET',
  '{base_url}/api/v1/user/{user_id}?format=json',
  $headers
);
$response = $client->sendAsync($request)->wait();
echo $response->getBody();
{% endhighlight %}
</details>

#### Expected Response (`200 OK`)

```json
{
  "uid": 1234,
  "name": "user-name",
  "api_key": "1a2b3c4d5e6f7g8h9i0j"
}
```

> **Notes:**
>
> - `{uid}` **must be your own** user ID. Requesting any other uid returns `403`.
> - This endpoint never rotates a key. To rotate, use Option A (**Generate new key**).

---

## 4. Reading a location — GET {#read}

```
GET /api/v1/location/{location_id}?_format=json
api-key: <your_key>
Accept: application/json
```

`{location_id}` is the location's business identifier (its `field_loc_id` value). RDG will confirm the identifier scheme for your locations.

#### Code Examples

<details>
<summary>cURL</summary>
{% highlight bash %}
curl -H "api-key: <your_key>" \
  "https://{base_url}/api/v1/location/{location_id}?_format=json"
{% endhighlight %}
</details>

<details>
<summary>JS</summary>
{% highlight javascript %}
const headers = new Headers();
headers.append("api-key", "<your_key>");

const requestOptions = {
  method: "GET",
  headers: headers
};

fetch("http://{base_url}/api/v1/location/{location_id}?format=json", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
{% endhighlight %}
</details>

<details>
<summary>PHP</summary>
{% highlight php %}
// Using GuzzleHttp.
$client = new Client();
$headers = [
  'api-key' => '<your_key>',
];
$request = new Request('GET', 'http://{base_url}/api/v1/location/{location_id}?format=json', $headers);
$response = $client->sendAsync($request)->wait();
echo $response->getBody();
{% endhighlight %}
</details>

#### Expected Response (`200 OK`)

```json
{
  "location_id": "123456",
  "field_loc_address": {
    "address_line1": "123 Main St",
    "address_line2": "",
    "locality": "Springfield",
    "administrative_area": "IL",
    "postal_code": "12345",
    "country_code": "US"
  },
  "field_loc_enterprise": "ACME-123",
  "field_internal_location_name": "Downtown - Unit 4"
}
```

---

## 5. Updating a location — PATCH {#update}

```
PATCH /api/v1/location/{location_id}?_format=json
api-key: <your_key>
Content-Type: application/json
Accept: application/json

{ ...fields to change... }
```

`PATCH` is a **partial update**: only the top-level fields you include in the body are changed. Any field you omit is left exactly as it was.

#### Code Examples

<details>
<summary>cURL</summary>
{% highlight bash %}
curl --location --request PATCH 'http://{base_url}/api/v1/location/{location_id}?format=json' \
--header 'Content-Type: application/json' \
--header 'api-key: <your_key>' \
--data '{
    "field_internal_location_name": "Downtown Springfield",
    "field_loc_enterprise": "1234 Springfield",
    "field_loc_address": {
        "address_line1": "22 Main St",
        "locality": "Springfield",
        "administrative_area": "IL",
        "postal_code": "12345"
    }
}'
{% endhighlight %}
</details>

<details>
<summary>JS</summary>
{% highlight javascript %}
const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("api-key", "<your_key>");

const body = JSON.stringify({
  "field_internal_location_name": "Downtown Chicago",
  "field_loc_enterprise": "1234 Chicago",
  "field_loc_address": {
      "address_line1": "22 Main St",
      "locality": "Chicago",
      "postal_code": "12345",
  }
});

const requestOptions = {
  method: "PATCH",
  headers: headers,
  body: body
};

fetch("http://{base_url}/api/v1/location/{location_id}?format=json", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
{% endhighlight %}
</details>

<details>
<summary>PHP</summary>
{% highlight php %}
// Using GuzzleHttp.
$client = new Client();
$headers = [
  'Content-Type' => 'application/json',
  'api-key' => '<your_key>',
];
$body = '{
  "field_internal_location_name": "Downtown Chicago",
  "field_loc_enterprise": "1234 Chicago",
  "field_loc_address": {
      "address_line1": "22 Main St",
      "locality": "Chicago",
      "postal_code": "12345",
  }
}';
$request = new Request('PATCH', 'http://{base_url}/api/v1/location/{location_id}?format=json', $headers, $body);
$response = $client->sendAsync($request)->wait();
echo $response->getBody();
{% endhighlight %}
</details>

#### Expected Response (`200 OK`)

Echoes back only the field(s) that changed, plus a confirmation.

```json
{
  {
    "field_internal_location_name": "Downtown Chicago",
    "field_loc_enterprise": "1234 Chicago",
    "field_loc_address": {
      "address_line1": "22 Main St",
      "address_line2": "",
      "locality": "Chicago",
      "administrative_area": "IL",
      "postal_code": "12345",
      "country_code": "US"
    }
  }
  "status": "Success",
  "message": "The listed field(s) have been successfully updated on location 123456"
}
```

### The address field is merged, not replaced

`field_loc_address` is special: sending it **merges** your sub-keys into the current address. Send only the sub-keys you want to change; the rest of the address is preserved. For example, to change only the street line:

```json
{
  "field_loc_address": {
    "address_line1": "500 New Street"
  }
}
```

The response reads the merged result back:

```json
{
  "field_loc_address": {
    "address_line1": "500 New Street",
    "address_line2": "",
    "locality": "Springfield",
    "administrative_area": "IL",
    "postal_code": "62704",
    "country_code": "US"
  },
  "status": "Success",
  "message": "The listed field(s) have been successfully updated on location LOC-0421"
}
```

---

## 6. Writable fields {#fields}

These are the only fields this API can read or write. No other field on a location, and no other content type, is reachable through it.

| Field | Type | Description |
| --- | --- | --- |
| `field_loc_enterprise` | string | Enterprise / franchise identifier. |
| `field_internal_location_name` | string | Internal identifier/name for the location. |
| `field_loc_address` | object | Location address (see sub-keys below). |

**`field_loc_address` sub-keys** (all optional in a `PATCH`; only the ones you send are updated):

| Sub-key | Description |
| --- | --- |
| `address_line1` | Street address, line 1. |
| `address_line2` | Street address, line 2 (may be empty or `null`). |
| `locality` | City / town. |
| `administrative_area` | State / province (e.g. `IL`). |
| `postal_code` | ZIP / postal code. |
| `country_code` | Two-letter country code. Must be `US`. |

Sending any top-level key other than the three above, or any address sub-key other than those listed, is rejected with `400` (see Section 7).

---

## 7. Response codes {#response-codes}

| Status | Meaning |
| --- | --- |
| `200` | Success. |
| `400` | Bad request — an unknown field name, an unknown address sub-key, or a wrong value type. |
| `401` | Missing or invalid credentials (no/invalid API key, or bad Basic Auth on the key endpoint). |
| `403` | Authenticated, but not authorized for this action (e.g. requesting another user's key). |
| `404` | No location exists for the given `{location_id}` (on the domain this request targets — see Section 8). |
| `422` | The update failed validation (e.g. a `country_code` other than `US`). |

Error responses include a JSON `message` describing the problem.

---

## 8. Important notes {#notes}

- **Target the correct hostname.** A location is associated with a specific site domain. Calling the API on a different hostname than the location's assigned domain returns `404` even with a valid key and identifier.
- **HTTPS is required.** Both the API key and (for the key endpoint) your password are sent in headers with no additional encryption of their own.
- **Publication state is preserved.** A `PATCH` never changes a location's publication/moderation state — it only updates, in place, the fields you send.
- **The field whitelist is fixed.** The three fields in §5 are the entire surface of this API by design; there is no parameter to widen it.
