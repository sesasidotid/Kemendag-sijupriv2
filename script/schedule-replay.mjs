/**
 * ================================
 * CONFIG
 * ================================
 */

// Optional override (null = use current datetime)
const BASE_TIME_OVERRIDE = "2026-02-10T10:10"
// Example:
// const BASE_TIME_OVERRIDE = '2026-03-01T09:00'

const BASE_URL = "http://103.217.144.101:8000/api/v1/exam_schedule"
const BEARER_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJzaWp1cHJpLXdlYiIsImp0aSI6ImViYTJmZDc3ZTc1YzI0NGFkYjhkNTQ0ZWRmZDUyNWY0ZjlmMDZhMzg4Y2IyMjU5ZDgzMDJjYjcwY2U3YjYwOTllYmZkNmNjNjYxOTZkMDhhIiwiaWF0IjoxNzY5OTk4NTUxLjUxOTE3NCwibmJmIjoxNzY5OTk4NTUxLjUxOTE3OSwiZXhwIjoxNzcyOTk4NTUxLjQ2OTgzNCwic3ViIjoiMTExMTExMTExMTExMTExMTExIiwic2NvcGVzIjpbXSwiZGV0YWlscyI6eyJpZCI6IjExMTExMTExMTExMTExMTExMSIsIm5hbWUiOiJHb2xkaWFuIFBha3BhaGFuIiwicm9sZV9jb2RlcyI6WyJBRE1JTiJdLCJtZW51X2NvZGVzIjpbIk1OVV9BS1AwMDAxIiwiTU5VX0FLUDAwMDMiLCJNTlVfQUtQMDAwMiIsIk1OVV9BS1AwMDA0IiwiTU5VX0FLUDAwMDUiLCJNTlVfQUtQMDAwNiIsIk1OVV9GT1IwMDAxIiwiTU5VX0ZPUjAwMDIiLCJNTlVfRk9SMDAwMyIsIk1OVV9GT1IwMDA0IiwiTU5VX0ZPUjAwMDUiLCJNTlVfUEFLMDAwMSIsIk1OVV9QQUswMDAyIiwiTU5VX1BBSzAwMDMiLCJNTlVfVUtNMDAwMSIsIk1OVV9VS00wMDAyIiwiTU5VX1VLTTAwMDMiLCJNTlVfVUtNMDAwNCIsIk1OVV9VS00wMDA1IiwiTU5VX1VLTTAwMDYiLCJNTlVfVUtNMDAwNyIsIk1OVV9VS00wMDA4IiwiTU5VX1VLTTAwMDkiLCJNTlVfVUtNMDAxMCIsIk1OVV9VS00wMDEyIiwiTU5VX1NJUDAwMDEiLCJNTlVfU0lQMDAwMiIsIk1OVV9TSVAwMDAzIiwiTU5VX1NJUDAwMDQiLCJNTlVfU0VDMDAwMSIsIk1OVV9TRUMwMDAyIiwiTU5VX1NFQzAwMDMiLCJNTlVfTU5UMDAwMSIsIk1OVV9NTlQwMDAyIiwiTU5VX01OVDAwMDMiLCJNTlVfTU5UMDAwNCIsIk1OVV9NTlQwMDA1IiwiTU5VX01OVDAwMDYiLCJNTlVfTU5UMDAwNyIsIk1OVV9NTlQwMDA4IiwiTU5VX1JQVDAwMDEiLCJNTlVfUlBUMDAwMiIsIk1OVV9SUFQwMDAzIiwiTU5VX1JQVDAwMDQiLCJNTlVfUlBUMDAwNSJdLCJhcHBsaWNhdGlvbl9jb2RlIjoic2lqdXByaS1hZG1pbiIsImluc3RhbnNpX2lkIjpudWxsLCJ1bml0X2tlcmphX2lkIjpudWxsLCJ1cmxzIjpbIi9hcGkvdjEvKip8Q1VEIl19fQ.BFMqr4qXakbwpCDIEsTr_R7tByVJa35CukI5Gmok-H9eLB1UILf_7AMVlR5hGS5ICl2oyj5PV5LVOBoIBY3ilnvZU04IkazUQYjMu8IY-RlzbtOzpeETv6K3MFhEILuLGqV9DdGgLebg-YT_sQTC2ZZfOmlmgj0CvPmol5ry-bN5XS0jG3AbkQY0Q6pw9Uw_vIhrJzyjUJQeBm63NdYIgB6Lh6rC5J6FKWSjffrzl_mSg0QBPew_fLDKeBgfozdWv8LWOAZkM3Vhurreh4EN2YkzHL05clGQiLE_Q_OFHVJsAYS0fn1KgkmTQX76crZRNXAXqW7IXs2un2wfPwQNxlKs9U0hHCSHieLNSOEBc2mDxLHLXcxdXplUEhKgpMjAbWBDPhqUarIQgwVMYu-fmH18l8DsEEog8U6JEYeypkno4Y5i27yGUJi-xLyabSL2rnToK-0ck2oGZZ81GvI07dY8S2w-_doB_1rpZXhykcwOvHssNubYtFEarBRfRxgYRrAj7USh-YCOOCPxdjE1qm4XIFpeGZqzfBzs9wxmIV2cizBjWQe03W_GM-2AbXAe0y3lw3ha_F7GeXdm7k9MxwvrJC7HP6hJaaTPGt8EKiV_wwp9Nd8xmd7na9bZdlb_9funMum_21E7RbHzSXnjDOjralAnfKajlN7eiQbZwXo"

/**
 * ================================
 * ORIGINAL PAYLOADS
 * ================================
 */

const schedules = [
    {
        path: "wawancara",
        payload: {
            roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b",
            startTime: "2026-02-06T10:19",
            endTime: "2026-02-14T10:19",
            duration: 1,
            participantIdList: [],
            examinerIdList: [
                "d666f6ea-37ec-411c-818c-9e23d1f74dfa",
                "e699b126-3be4-4490-add5-5feb583a1310",
            ],
        },
    },
    {
        path: "praktik",
        payload: {
            roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b",
            startTime: "2026-02-06T10:20",
            endTime: "2026-02-14T10:20",
            secretKey: null,
            participantIdList: [],
            examinerIdList: [
                "d666f6ea-37ec-411c-818c-9e23d1f74dfa",
                "e699b126-3be4-4490-add5-5feb583a1310",
            ],
        },
    },
    {
        path: "portofolio",
        payload: {
            roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b",
            startTime: "2026-02-06T10:20",
            endTime: "2026-02-14T10:20",
            secretKey: null,
            participantIdList: [],
            examinerIdList: [
                "e699b126-3be4-4490-add5-5feb583a1310",
                "d666f6ea-37ec-411c-818c-9e23d1f74dfa",
            ],
        },
    },
    {
        path: "makalah",
        payload: {
            roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b",
            makalahStartTime: "2026-02-06T10:21",
            makalahEndTime: "2026-02-07T10:21",
            seminarStartTime: "2026-02-08T10:21",
            seminarEndTime: "2026-02-10T10:21",
            duration: 0.5,
            participantIdList: [],
            examinerIdList: [
                "d666f6ea-37ec-411c-818c-9e23d1f74dfa",
                "e699b126-3be4-4490-add5-5feb583a1310",
            ],
        },
    },
    {
        path: "studi_kasus",
        payload: {
            roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b",
            startTime: "2026-02-06T10:21",
            endTime: "2026-02-11T10:21",
            secretKey: "1",
            participantIdList: [],
            examinerIdList: [
                "d666f6ea-37ec-411c-818c-9e23d1f74dfa",
                "e699b126-3be4-4490-add5-5feb583a1310",
            ],
        },
    },
    {
        path: "cat",
        payload: {
            roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b",
            startTime: "2026-02-06T10:25",
            endTime: "2026-02-10T10:25",
            duration: 0.5,
            secretKey: "1",
            participantIdList: [],
        },
    },
]

/**
 * ================================
 * TIME LOGIC
 * ================================
 */

const DATE_FIELDS = [
    "startTime",
    "endTime",
    "makalahStartTime",
    "makalahEndTime",
    "seminarStartTime",
    "seminarEndTime",
]

const allDates = schedules.flatMap(({ payload }) =>
    DATE_FIELDS.filter((k) => payload[k]).map((k) => new Date(payload[k])),
)

const earliestDate = allDates.reduce((a, b) => (a < b ? a : b))
const baseDate = BASE_TIME_OVERRIDE ? new Date(BASE_TIME_OVERRIDE) : new Date()

const adjustDates = (payload) => {
    const adjusted = { ...payload }

    for (const field of DATE_FIELDS) {
        if (!payload[field]) continue

        const original = new Date(payload[field])
        const offset = original.getTime() - earliestDate.getTime()
        const shifted = new Date(baseDate.getTime() + offset)

        adjusted[field] = shifted.toISOString().slice(0, 16)
    }

    return adjusted
}

/**
 * ================================
 * EXECUTION
 * ================================
 */

const postJson = async (url, body) => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} ${text}`)
    }
}

const run = async () => {
    for (const { path, payload } of schedules) {
        const adjustedPayload = adjustDates(payload)

        await postJson(`${BASE_URL}/${path}`, adjustedPayload)

        console.log(`✔ Posted ${path}`)
    }
}

run().catch(console.error)
