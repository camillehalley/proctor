class Submission < ApplicationRecord
  belongs_to :survey
  has_many :responses

  enum role: { engineer: 0, designer: 1, product_manager: 2 }
end
