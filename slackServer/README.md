SM Peer Polling

API is as follows: 

/order = post a single order with json of structure: 
{
    "a5": "sig_mtx",
    "a4": "patient_pre",
    "a3": "mtx_contra",
    "a2": "physician_pre",
    "a1": "mtx_int",
    "sessionId": "1407276934575",
    "order": [
        "mtx_int",
        "physician_pre",
        "mtx_contra",
        "patient_pre",
        "sig_mtx"
    ]
}

/orders = post an array of orders

/stats = get statistics of current database. will return json of structure: 
{
	"1" : {
		"name" : "mtx_int",
		"score" : 4,
		"percentage" : 0.8
	},
	"2" : {
		"name" : "patient_pre",
		"score" : 1,
		"percentage" : 0.2
	},
	"total" : 16
}