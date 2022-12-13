package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/AdityaHegde/bitburner-scripts/cli/database"
)

func (s *Server) getHackMetadata(w http.ResponseWriter, r *http.Request) {
	count := 50
	var err error
	if r.URL.Query().Has("count") {
		count, err = strconv.Atoi(r.URL.Query().Get("count"))
	}

	res, err := database.GetNHackMetadata(s.db, count)
	sendJsonResponse(res, err, w)
}

func (s *Server) getServerStats(w http.ResponseWriter, r *http.Request) {
	ids := getIdsFromRequest(r)
	res, err := database.GetServerStatsByIDs(s.db, ids)
	sendJsonResponse(res, err, w)
}

func (s *Server) getHackTargets(w http.ResponseWriter, r *http.Request) {
	ids := getIdsFromRequest(r)
	res, err := database.GetTargetsByIDs(s.db, ids)
	sendJsonResponse(res, err, w)
}

func getIdsFromRequest(r *http.Request) []uint {
	var ids []uint
	if r.URL.Query().Has("ids") {
		idsStr := strings.Split(r.URL.Query().Get("ids"), ",")
		for _, idStr := range idsStr {
			id, err := strconv.Atoi(idStr)
			if err != nil {
				break
			}
			ids = append(ids, uint(id))
		}
	}
	return ids
}

func sendJsonResponse(v any, err error, w http.ResponseWriter) {
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	jsonData, err := json.Marshal(v)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	w.Write(jsonData)
}
