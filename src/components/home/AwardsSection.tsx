import { awardsData } from "@/data/awards";

export default function AwardsSection() {
  return (
    <section className="awards">
      <div className="awards-inner">
        <div className="w-layout-grid grid row-0">
          <div
            id="w-node-_05cf82f1-6b6e-8f7c-c770-f133695cf5da-ef9a5cf3"
            className="awards--heading-wrap"
          >
            <h1 data-reveal="text" className="h1">
              Awards
            </h1>
          </div>
          <h1
            data-reveal="text"
            id="w-node-_9448f436-9bf9-2563-275c-334e098a3850-ef9a5cf3"
            className="h1"
          >
            &amp;
          </h1>
          <h1
            data-reveal="text"
            id="w-node-_7997afcf-e344-c1f7-2ee7-9e212865c18c-ef9a5cf3"
            className="h1"
          >
            Recog-
          </h1>
          <h1
            data-reveal="text"
            id="w-node-af7749f1-fef4-37e3-3122-b9dba9216442-ef9a5cf3"
            className="h1"
          >
            nitions
          </h1>
        </div>

        <div className="w-layout-grid grid">
          <div
            id="w-node-_809a9322-2ff7-ab7f-4189-7923554e02db-ef9a5cf3"
            className="d-awards-master-list-wrap w-dyn-list"
          >
            <div role="list" className="d-awards-master-list w-dyn-items">
              {awardsData.map((group, gIdx) => (
                <div
                  key={group.year + gIdx}
                  role="listitem"
                  className="d-awards-master-item w-dyn-item"
                >
                  <div className="d-awards-list-wrap w-dyn-list">
                    <div role="list" className="d-awards-list w-dyn-items">
                      <div
                        data-reveal="div"
                        role="listitem"
                        className="d-awards-item w-dyn-item"
                      >
                        <div
                          id="w-node-_36a131df-ad3b-b670-adae-57e3595eed68-ef9a5cf3"
                          className="d-award-item-cell is-year"
                        >
                          <div className="p1">{group.year}</div>
                        </div>
                        <div
                          id="w-node-ee213411-7f28-e1a8-8dfa-bfca61f1472d-ef9a5cf3"
                          className="d-award-item-cell is-name"
                        >
                          <div className="p1">{group.project}</div>
                        </div>
                        <div
                          id="w-node-e0a38a0f-1170-a17f-f856-07265fca8040-ef9a5cf3"
                          className="d-award-list-wrap w-dyn-list"
                        >
                          <div role="list" className="d-award-list w-dyn-items">
                            {group.awards.map((award, aIdx) => (
                              <div
                                key={award.platform + award.title + aIdx}
                                data-haptic="medium"
                                data-award="item"
                                role="listitem"
                                className="d-award-item w-dyn-item"
                              >
                                <div
                                  id="w-node-_76c949f9-3e40-2128-2412-0f5d77385843-ef9a5cf3"
                                  className="award-item-cell is-desktop"
                                ></div>
                                <div
                                  id="w-node-_5e604b89-1494-4521-2471-8b83e425edfa-ef9a5cf3"
                                  className="award-item-cell is-desktop"
                                ></div>
                                <div
                                  id="w-node-_6c54cdcb-8b66-736c-e38c-e8e9740fdd13-ef9a5cf3"
                                  className="award-item-cell"
                                >
                                  <div className="p1">{award.platform}</div>
                                  {award.certificateImage && (
                                    <div
                                      data-award="certificate"
                                      className="award-item-certificate"
                                    >
                                      <img
                                        src={award.certificateImage}
                                        loading="lazy"
                                        alt={
                                          award.certificateAlt ||
                                          `${award.platform} ${award.title} certificate`
                                        }
                                        className="img"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div
                                  id="w-node-_916043a2-cf0a-b591-8650-a073d3790df8-ef9a5cf3"
                                  className="award-item-cell"
                                >
                                  <div className="p1">{award.title}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
