class Submission < ApplicationRecord
  belongs_to :survey
  has_many :responses

  enum role: { engineer: "engineer", designer: "designer", product_manager: "product_manager" }
end
