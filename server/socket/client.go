package socket

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
	id   int
	resp map[int]chan map[string]any
}

func NewClient(conn *websocket.Conn) *Client {
	return &Client{
		conn: conn,
		id:   0,
		resp: make(map[int]chan map[string]any),
	}
}

func (c *Client) reader() {
	for {
		// read in a message
		_, p, err := c.conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		// parse json
		var resp map[string]any
		err = json.Unmarshal(p, &resp)
		if err != nil {
			log.Println(err)
		}
		// send to channel
		id := int(resp["id"].(float64))
		ch, ok := c.resp[id]
		if ok {
			ch <- resp
			close(ch)
			delete(c.resp, id)
		}
	}
}

func (c *Client) send(id int, msg interface{}) (map[string]any, error) {
	msgInBytes, err := json.Marshal(msg)
	if err != nil {
		return nil, err
	}

	err = c.conn.WriteMessage(1, msgInBytes)
	if err != nil {
		return nil, err
	}

	ch := make(chan map[string]any)
	c.resp[id] = ch
	res := <-ch

	return res, nil
}
