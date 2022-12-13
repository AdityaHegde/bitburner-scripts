package client

import (
	"errors"

	"github.com/mitchellh/mapstructure"
)

type Request struct {
	JSONRPC string            `json:"jsonrpc"`
	ID      int               `json:"id"`
	Method  string            `json:"method"`
	Params  map[string]string `json:"params"`
}

var FileMissing = errors.New("file missing")

func (c *Client) GetFileNames(server string) ([]string, error) {
	c.id++
	id := c.id
	res, err := c.send(id, &Request{
		JSONRPC: "2.0",
		ID:      id,
		Method:  "getFileNames",
		Params: map[string]string{
			"server": server,
		},
	})
	if err != nil {
		return nil, err
	}

	var fileNames []string
	err = mapstructure.Decode(res["result"], &fileNames)
	if err != nil {
		return nil, err
	}

	return fileNames, nil
}

func (c *Client) PushFile(server string, fileName string, content string) error {
	c.id++
	id := c.id
	res, err := c.send(id, &Request{
		JSONRPC: "2.0",
		ID:      id,
		Method:  "pushFile",
		Params: map[string]string{
			"server":   server,
			"filename": fileName,
			"content":  content,
		},
	})
	if err != nil {
		return err
	}

	statusText := res["result"].(string)
	if statusText != "OK" {
		return errors.New(statusText)
	}
	return nil
}

func (c *Client) GetFile(server string, fileName string) (string, error) {
	c.id++
	id := c.id
	res, err := c.send(id, &Request{
		JSONRPC: "2.0",
		ID:      id,
		Method:  "getFile",
		Params: map[string]string{
			"server":   server,
			"filename": fileName,
		},
	})
	if err != nil {
		return "", err
	}
	if res["result"] == nil {
		return "", FileMissing
	}

	return res["result"].(string), nil
}

func (c *Client) DeleteFile(server string, fileName string) error {
	c.id++
	id := c.id
	res, err := c.send(id, &Request{
		JSONRPC: "2.0",
		ID:      id,
		Method:  "deleteFile",
		Params: map[string]string{
			"server":   server,
			"filename": fileName,
		},
	})
	if err != nil {
		return err
	}

	statusText := res["result"].(string)
	if statusText != "OK" {
		return errors.New(statusText)
	}
	return nil
}

func (c *Client) CalculateRam(server string, fileName string) (float64, error) {
	c.id++
	id := c.id
	res, err := c.send(id, &Request{
		JSONRPC: "2.0",
		ID:      id,
		Method:  "calculateRam",
		Params: map[string]string{
			"server":   server,
			"filename": fileName,
		},
	})
	if err != nil {
		return 0, err
	}

	return res["result"].(float64), nil
}

// TODO: getAllFiles, getDefinitionFile
